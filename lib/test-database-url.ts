/** Fail closed before a test can connect to an application database. */
export function assertTestDatabaseUrl(value: string | undefined): string {
  let url: URL;
  try {
    url = new URL(value ?? "");
  } catch {
    throw new Error("Pengujian memerlukan URL database uji yang eksplisit.");
  }
  const database = decodeURIComponent(url.pathname.slice(1));
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !/(^|_)test(_|$)/i.test(database)
  )
    throw new Error(
      "Database pengujian harus memiliki penanda _test; database aplikasi ditolak."
    );
  return value!;
}
