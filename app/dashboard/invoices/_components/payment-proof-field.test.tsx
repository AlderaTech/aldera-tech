import { describe, it, expect, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { API_ROUTES } from "@/lib/routes";
import type { InvoicePaymentState } from "../_hooks/use-invoice-payment";
import { PaymentProofField } from "./payment-proof-field";
const state: InvoicePaymentState = {
  activeTab: "manual",
  setActiveTab: mock(),
  copiedBank: null,
  selectedFile: null,
  previewUrl: null,
  notes: "",
  setNotes: mock(),
  fileError: null,
  requestError: null,
  isUploading: false,
  isStartingMidtrans: false,
  isPending: false,
  isBusy: false,
  handleCopy: mock(),
  handleFileChange: mock(),
  handleMidtransPayment: mock(),
  handleSubmitProof: mock(),
};
describe("Access-controlled proof field", () => {
  it("renders private image URLs directly and keeps protected PDF previews usable", () => {
    const image = API_ROUTES.fileDownload("image", "proof.webp");
    const html = renderToStaticMarkup(
      <PaymentProofField
        payment={{ ...state, previewUrl: image }}
        hasExistingProof
      />
    );
    expect(html).toContain(image);
    expect(html).not.toContain("/_next/image");
    expect(html).toContain("(Opsional)");
    const pdf = API_ROUTES.fileDownload("pdf", "proof.pdf");
    const document = renderToStaticMarkup(
      <PaymentProofField
        payment={{ ...state, previewUrl: pdf }}
        hasExistingProof
      />
    );
    expect(document).toContain("PDF");
    expect(document).toContain(pdf);
  });
});
