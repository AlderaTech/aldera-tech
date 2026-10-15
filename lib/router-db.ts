import {
  Pool,
  type PoolClient,
  type QueryResult,
  type QueryResultRow,
} from "pg";

/**
 * Secondary PostgreSQL Database Client for Aldera AI API Relay (`aldera_router`).
 * Enforces immutable ledger constraints and connection pooling singleton.
 */

const globalForRouterDb = globalThis as unknown as {
  routerPool: Pool | undefined;
};

// Patterns strictly prohibited on immutable audit tables
const FORBIDDEN_AUDIT_PATTERNS = [
  /\bUPDATE\s+(ONLY\s+)?("?public\s*"?\s*\.)?\s*"?balance_transactions"?\b/i,
  /\bDELETE\s+FROM\s+(ONLY\s+)?("?public\s*"?\s*\.)?\s*"?balance_transactions"?\b/i,
  /\bTRUNCATE(\s+TABLE)?(\s+ONLY)?\s+("?public\s*"?\s*\.)?\s*"?balance_transactions"?\b/i,
  /\bDELETE\s+FROM\s+(ONLY\s+)?("?public\s*"?\s*\.)?\s*"?usage_logs"?\b/i,
  /\bTRUNCATE(\s+TABLE)?(\s+ONLY)?\s+("?public\s*"?\s*\.)?\s*"?usage_logs"?\b/i,
];

/**
 * Asserts that a SQL query does not attempt to mutate or delete immutable audit records
 * (balance_transactions and usage_logs).
 * Strips comments, normalizes whitespace and quotes, and checks against immutability rules.
 * Throws an error immediately before dispatching to the database.
 */
export function assertQuerySafety(sql: string): void {
  if (!sql || typeof sql !== "string") {
    return;
  }

  // 1. Strip block comments (/* ... */) and line comments (-- ...)
  const stripped = sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--.*$/gm, " ");

  // 2. Normalize whitespace and collapse spacing around quotes and dots
  const normalized = stripped
    .replace(/\s+/g, " ")
    .replace(/\s*\.\s*/g, ".")
    .replace(/([a-zA-Z0-9_])"(?=[a-zA-Z0-9_])/g, '$1 "')
    .trim();

  // 3. Robust patterns covering optional ONLY and quoted identifiers
  for (const pattern of FORBIDDEN_AUDIT_PATTERNS) {
    if (pattern.test(normalized)) {
      throw new Error(
        "Audit immutability violation: Modification (UPDATE/DELETE/TRUNCATE) on balance_transactions or deletion on usage_logs is strictly forbidden."
      );
    }
  }
}

/**
 * Returns the singleton `pg.Pool` instance connected to `process.env.ROUTER_DATABASE_URL`.
 */
export function getRouterPool(): Pool {
  if (!globalForRouterDb.routerPool) {
    const connectionString =
      process.env.ROUTER_DATABASE_URL ||
      "postgresql://postgres:postgres@localhost:5432/aldera_router";

    globalForRouterDb.routerPool = new Pool({
      connectionString,
      max: process.env.NODE_ENV === "production" ? 20 : 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return globalForRouterDb.routerPool;
}

/**
 * Executes a parameterized SQL query on the `aldera_router` database pool.
 * Automatically checks SQL text against immutability rules.
 */
export async function queryRouter<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  assertQuerySafety(sql);
  const pool = getRouterPool();
  return pool.query<T>(sql, params);
}

function wrapClientWithSafety(client: PoolClient): PoolClient {
  const originalQuery = client.query.bind(client);
  client.query = (async (...args: Parameters<typeof originalQuery>) => {
    const firstArg = args[0] as unknown;
    const text =
      typeof firstArg === "string"
        ? firstArg
        : (firstArg as { text?: string } | undefined)?.text;
    if (text) {
      assertQuerySafety(text);
    }
    return originalQuery(...args);
  }) as typeof client.query;
  return client;
}

/**
 * Executes a transaction on the `aldera_router` database.
 * Acquires a client, issues BEGIN, runs callback, and automatically COMMITs on success
 * or ROLLBACKs on failure.
 */
export async function transactionRouter<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const pool = getRouterPool();
  const client = await pool.connect();
  const safeClient = wrapClientWithSafety(client);
  try {
    await safeClient.query("BEGIN");
    const result = await fn(safeClient);
    await safeClient.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await safeClient.query("ROLLBACK");
    } catch {
      // Ignore rollback failure if connection was lost
    }
    throw error;
  } finally {
    client.release();
  }
}

export interface LedgerInvariantResult {
  check_name: string;
  status: "PASS" | "FAIL";
  violation_count: number;
  details: string;
}

/**
 * Executes the database diagnostic function `verify_ledger_invariants()`,
 * returning verification status for all 5 financial invariants.
 */
export async function verifyLedgerInvariants(): Promise<LedgerInvariantResult[]> {
  const res = await queryRouter<{
    check_name: string;
    status: "PASS" | "FAIL";
    violation_count: string | number;
    details: string;
  }>(
    "SELECT check_name, status, violation_count, details FROM verify_ledger_invariants();"
  );

  return res.rows.map((row) => ({
    check_name: row.check_name,
    status: row.status,
    violation_count: Number(row.violation_count),
    details: row.details,
  }));
}

/**
 * Closes the router database pool. Useful for test suites and graceful shutdown.
 */
export async function closeRouterPool(): Promise<void> {
  if (globalForRouterDb.routerPool) {
    await globalForRouterDb.routerPool.end();
    globalForRouterDb.routerPool = undefined;
  }
}
