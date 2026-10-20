import { Pool, type PoolClient } from "pg";

/**
 * Distributed Advisory Lock for scheduled cron jobs using PostgreSQL session-level advisory locks.
 *
 * PostgreSQL advisory locks (pg_try_advisory_lock) are session-level and tied to a single
 * backend connection PID. This ensures that:
 * 1. A dedicated connection is acquired from the pool for the lifetime of the cron job.
 * 2. Overlapping job executions immediately detect the held lock and cleanly skip execution.
 * 3. The lock is guaranteed to be released in the `finally` block or upon connection termination.
 */

const globalForCronPool = globalThis as unknown as {
  cronPool: Pool | undefined;
};

/**
 * Returns or initializes the dedicated `pg.Pool` instance for cron advisory locking.
 */
export function getCronPool(): Pool {
  if (!globalForCronPool.cronPool) {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.ROUTER_DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/aldera_tech";

    globalForCronPool.cronPool = new Pool({
      connectionString,
      max: process.env.NODE_ENV === "production" ? 10 : 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return globalForCronPool.cronPool;
}

/**
 * Closes the cron locking database pool. Useful for testing and graceful process shutdown.
 */
export async function closeCronPool(): Promise<void> {
  if (globalForCronPool.cronPool) {
    await globalForCronPool.cronPool.end();
    globalForCronPool.cronPool = undefined;
  }
}

export interface CronLockOptions {
  pool?: Pool;
  client?: PoolClient;
  rethrowError?: boolean;
}

export interface CronLockResult<T> {
  executed: boolean;
  skipped: boolean;
  result?: T;
  error?: Error;
  reason?: string;
}

/**
 * Wraps a task with a PostgreSQL distributed advisory lock.
 *
 * @param lockKey Unique identifier for the cron task (e.g. 'invoice-reminder', 'balance-guard')
 * @param task Async callback to execute while holding the advisory lock
 */
export async function withCronLock<T>(
  lockKey: string,
  task: () => Promise<T>
): Promise<CronLockResult<T>>;
export async function withCronLock<T>(
  lockKey: string,
  options: CronLockOptions,
  task: () => Promise<T>
): Promise<CronLockResult<T>>;
export async function withCronLock<T>(
  lockKey: string,
  taskOrOptions: (() => Promise<T>) | CronLockOptions,
  maybeTask?: () => Promise<T>
): Promise<CronLockResult<T>> {
  const options: CronLockOptions =
    typeof taskOrOptions === "function" ? {} : taskOrOptions;
  const task: () => Promise<T> =
    typeof taskOrOptions === "function" ? taskOrOptions : maybeTask!;

  if (typeof task !== "function") {
    throw new TypeError("[CronLock] Task callback must be a function");
  }

  const pool = options.pool ?? getCronPool();
  let client: PoolClient | null = null;
  let ownsClient = false;

  try {
    if (options.client) {
      client = options.client;
      ownsClient = false;
    } else {
      client = await pool.connect();
      ownsClient = true;
    }
  } catch (connErr) {
    const error =
      connErr instanceof Error ? connErr : new Error(String(connErr));
    console.error(
      `[CronLock] Failed to acquire database connection for '${lockKey}':`,
      error
    );
    return {
      executed: false,
      skipped: true,
      error,
      reason: `Database connection unavailable: ${error.message}`,
    };
  }

  let lockAcquired = false;

  try {
    // Acquire PostgreSQL session advisory lock using hashtext to produce integer key
    const res = await client.query<{ acquired: boolean }>(
      "SELECT pg_try_advisory_lock(hashtext('cron:' || $1)) AS acquired;",
      [lockKey]
    );

    lockAcquired = Boolean(res.rows[0]?.acquired);

    if (!lockAcquired) {
      console.log(
        `[CronLock] Lock for '${lockKey}' is held by another process. Skipping cleanly.`
      );
      return {
        executed: false,
        skipped: true,
        reason: `Lock for '${lockKey}' is held by another process`,
      };
    }

    try {
      const result = await task();
      return {
        executed: true,
        skipped: false,
        result,
      };
    } catch (taskErr) {
      const error =
        taskErr instanceof Error ? taskErr : new Error(String(taskErr));
      console.error(`[CronLock] Error executing task '${lockKey}':`, error);
      if (options.rethrowError) {
        throw error;
      }
      return {
        executed: true,
        skipped: false,
        error,
      };
    } finally {
      if (lockAcquired && client) {
        try {
          await client.query(
            "SELECT pg_advisory_unlock(hashtext('cron:' || $1));",
            [lockKey]
          );
        } catch (unlockErr) {
          console.error(
            `[CronLock] Error releasing advisory lock for '${lockKey}':`,
            unlockErr
          );
        }
      }
    }
  } finally {
    if (ownsClient && client) {
      client.release();
    }
  }
}
