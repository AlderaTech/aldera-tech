import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { BANK_ACCOUNTS } from "../_data/bank-accounts";
import type { InvoicePaymentState } from "../_hooks/use-invoice-payment";
import { ManualPaymentForm } from "./manual-payment-form";
import { OnlinePaymentPanel } from "./online-payment-panel";

function state(
  overrides: Partial<InvoicePaymentState> = {}
): InvoicePaymentState {
  return {
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
    ...overrides,
  };
}

describe("Form pembayaran invoice", () => {
  it("mempertahankan rekening, field bukti, format file, catatan opsional, dan tombol submit", () => {
    const html = renderToStaticMarkup(
      <ManualPaymentForm
        payment={state()}
        hasExistingProof={false}
        onCancel={mock()}
      />
    );
    for (const account of BANK_ACCOUNTS) {
      expect(html).toContain(account.displayNumber);
      expect(html).toContain(account.accountName);
      expect(html).toContain(`Salin nomor rekening ${account.bank}`);
    }
    expect(html).toContain('id="proof-file"');
    expect(html).toContain(
      'accept="image/jpeg,image/png,image/webp,application/pdf"'
    );
    expect(html).toContain('aria-required="true"');
    expect(html).toContain('id="proof-notes"');
    expect(html).toContain("Catatan Pengirim (Opsional)");
    expect(html).toContain("Kirim Bukti Pembayaran");
    expect(html).toContain('type="submit"');
  });
  it("memperlihatkan validasi dekat field dan mempertahankan pilihan saat gagal", () => {
    const payment = state({
      fileError: "Ukuran file maksimal 10MB",
      requestError: "Upload gagal",
      notes: "Catatan uji dipertahankan",
      selectedFile: new File(["test"], "bukti.pdf", {
        type: "application/pdf",
      }),
    });
    const html = renderToStaticMarkup(
      <ManualPaymentForm
        payment={payment}
        hasExistingProof={false}
        onCancel={mock()}
      />
    );
    expect(html).toContain('id="proof-file-error"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain("Upload gagal");
    expect(html).toContain("Catatan uji dipertahankan");
    expect(html).toContain("bukti.pdf");
  });
  it("menjaga bukti sebelumnya opsional dan menonaktifkan tombol selama pengiriman", () => {
    const html = renderToStaticMarkup(
      <ManualPaymentForm
        payment={state({ isBusy: true, isPending: true })}
        hasExistingProof
        onCancel={mock()}
      />
    );
    expect(html).toContain("File Bukti Transfer (Opsional)");
    expect(html).toContain('aria-required="false"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("Mengirim...");
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled=""/);
  });
  it("menampilkan permintaan Midtrans yang sedang berlangsung dan pesan sistem", () => {
    const html = renderToStaticMarkup(
      <OnlinePaymentPanel
        payment={state({
          isBusy: true,
          isStartingMidtrans: true,
          requestError: "Sesi pembayaran belum tersedia",
        })}
      />
    );
    expect(html).toContain("Menyiapkan pembayaran...");
    expect(html).toContain("Sesi pembayaran belum tersedia");
    expect(html).toContain('disabled=""');
    expect(html).not.toContain("Pembayaran berhasil");
  });
});
