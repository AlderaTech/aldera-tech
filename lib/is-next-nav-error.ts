/**
 * Returns true if the given value is a Next.js internal redirect/notFound
 * signal that server actions throw via `redirect()` / `notFound()`.
 *
 * Catching these in try/catch would swallow the navigation, so client code
 * should re-throw them when they occur.
 */
export function isNextNavigationError(
  err: unknown
): err is Error & { digest: string } {
  if (!(err instanceof Error)) return false;
  const digest = (err as Error & { digest?: unknown }).digest;
  if (typeof digest !== "string") return false;
  return digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND";
}
