/** Upload scope is verified again by the server; the file alone is insufficient. */
export function createPaymentProofUpload(
  file: File,
  context: { invoiceId: string } | { topupId: number }
): FormData {
  const data = new FormData();
  data.set("file", file);
  if ("invoiceId" in context) data.set("invoiceId", context.invoiceId);
  else data.set("topupId", String(context.topupId));
  return data;
}
