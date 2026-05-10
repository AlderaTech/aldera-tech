/**
 * Safe DB wrapper, returns fallback on any error so pages can still render
 * (useful when the DB is unavailable during build or first boot).
 */
export async function safeDb<T>(
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[safeDb] fallback used:", (error as Error).message);
    }
    return fallback;
  }
}
