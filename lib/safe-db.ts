/**
 * Build-time fallbacks must never turn runtime outages into empty business data.
 */
export async function safeDb<T>(
  fn: () => Promise<T>,
  fallback: T,
  options?: { brandingFallback?: boolean; errorFallback?: boolean }
): Promise<T> {
  try {
    return await fn();
  } catch {
    if (
      process.env.NEXT_PHASE === "phase-production-build" ||
      options?.brandingFallback
    )
      return fallback;
    console.error("Database query failed; displaying a load error.");
    // Nullable results are used only by views with an explicit error panel.
    if (options?.errorFallback && fallback === null) return fallback;
    throw new Error("Data belum dapat dimuat. Silakan coba kembali.");
  }
}
