import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { createPaymentProofUpload } from "@/lib/payment-proof-upload";

describe("Invoice proof upload contract", () => {
  it("sends the invoice ownership context without changing the payment action", () => {
    const body = createPaymentProofUpload(new File(["fixture"], "proof.pdf"), {
      invoiceId: "invoice-fixture",
    });
    expect(body.get("invoiceId")).toBe("invoice-fixture");
    const code = readFileSync(
      new URL("./use-invoice-payment.ts", import.meta.url),
      "utf8"
    );
    expect(code).toContain("createPaymentProofUpload(selectedFile, {");
    expect(code).toContain("invoiceId: invoice.id");
    expect(code).toContain("fetch(API_ROUTES.upload");
    expect(code).toContain("submitPaymentProofAction({");
    expect(code).toContain("requestInFlight.current");
  });
});
