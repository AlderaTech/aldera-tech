const MAX_PAGE = 10_000;

export function parsePage(value: unknown): number {
  if (typeof value !== "string" && typeof value !== "number") return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) && page >= 1 ? Math.min(page, MAX_PAGE) : 1;
}

export function parsePageSize(value: unknown, fallback = 10): number {
  const size = Number(value);
  return Number.isSafeInteger(size) && size >= 1 && size <= 100
    ? size
    : fallback;
}
