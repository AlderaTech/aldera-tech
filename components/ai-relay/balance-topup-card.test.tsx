import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { BalanceTopupCard } from "./balance-topup-card";

describe("Saldo dan unggah bukti top-up", () => {
  it("renders the actual balance and honest empty history without mutating data", () => {
    const html = renderToStaticMarkup(
      <BalanceTopupCard initialBalance={123456} initialTransactions={[]} />
    );
    expect(html).toContain("123.456");
    expect(html).toContain("Top");
  });
  it("keeps the authorized ticket in the upload payload and uses the central API route", () => {
    const code = readFileSync(
      new URL("./balance-topup-card.tsx", import.meta.url),
      "utf8"
    );
    expect(code).toContain("createPaymentProofUpload(proofFile, {");
    expect(code).toContain("topupId: createdTopup.id");
    expect(code).toContain("fetch(API_ROUTES.upload");
    expect(code).toContain("uploadTopupProof(createdTopup.id, fileId)");
  });
});
