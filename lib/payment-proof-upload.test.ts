import { describe, expect, it } from "bun:test";
import { createPaymentProofUpload } from "./payment-proof-upload";

describe("Payment proof request payloads", () => {
  it("attaches the real invoice ID without requiring a project", () => {
    const file = new File(["fixture"], "proof.pdf", {
      type: "application/pdf",
    });
    const body = createPaymentProofUpload(file, {
      invoiceId: "invoice-fixture",
    });
    const uploaded = body.get("file") as File;
    expect(uploaded.name).toBe(file.name);
    expect(uploaded.size).toBe(file.size);
    expect(uploaded.type).toBe(file.type);
    expect(body.get("invoiceId")).toBe("invoice-fixture");
    expect(body.get("projectId")).toBeNull();
    expect(body.get("topupId")).toBeNull();
  });
  it("attaches the top-up ticket ID while preserving file contents", async () => {
    const body = createPaymentProofUpload(new File(["fixture"], "proof.pdf"), {
      topupId: 123,
    });
    expect(body.get("topupId")).toBe("123");
    expect(body.get("invoiceId")).toBeNull();
    expect(await (body.get("file") as File).text()).toBe("fixture");
  });
});
