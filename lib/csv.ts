/**
 * Convert a list of plain objects to a CSV string.
 * Fields are taken from the keys of the first object if not provided.
 */
export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  fields?: (keyof T)[]
): string {
  if (rows.length === 0 && !fields) return "";
  const keys = (fields ?? (Object.keys(rows[0]) as (keyof T)[])) as string[];

  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const s = value instanceof Date ? value.toISOString() : String(value);
    if (/[",\n\r]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const header = keys.map(escape).join(",");
  const body = rows
    .map((row) =>
      keys.map((k) => escape((row as Record<string, unknown>)[k])).join(",")
    )
    .join("\n");
  return `${header}\n${body}`;
}

export function csvResponse(csv: string, filename: string): Response {
  // Prepend BOM so Excel opens UTF-8 correctly
  const body = "\uFEFF" + csv;
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
