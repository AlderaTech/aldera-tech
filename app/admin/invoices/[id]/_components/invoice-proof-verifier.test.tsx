import { describe, it, expect, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { API_ROUTES } from "@/lib/routes";
mock.module("next/navigation", () => ({
  useRouter: () => ({ refresh: mock() }),
}));
mock.module("@/lib/actions/invoice", () => ({
  verifyPaymentProofAction: mock(),
  rejectPaymentProofAction: mock(),
}));
const { InvoiceProofVerifier } = await import("./invoice-proof-verifier");
describe("Private invoice proof preview", () => {
  it("loads images directly with browser credentials and retains PDF links", () => {
    const props = {
      invoiceId: "invoice",
      invoiceNumber: "INV-TEST",
      status: "PENDING_VERIFICATION" as const,
      paymentMethod: "MANUAL_TRANSFER",
    };
    const image = API_ROUTES.fileDownload("image", "proof.webp");
    const html = renderToStaticMarkup(
      <InvoiceProofVerifier {...props} paymentProofUrl={image} />
    );
    expect(html).toContain(image.replaceAll("&", "&amp;"));
    expect(html).not.toContain("/_next/image");
    const pdf = API_ROUTES.fileDownload("pdf", "proof.pdf");
    expect(
      renderToStaticMarkup(
        <InvoiceProofVerifier {...props} paymentProofUrl={pdf} />
      )
    ).toContain(pdf);
    expect(
      renderToStaticMarkup(
        <InvoiceProofVerifier {...props} paymentProofUrl={null} />
      )
    ).toBe("");
  });
});
