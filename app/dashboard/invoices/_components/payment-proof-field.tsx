import Image from "next/image";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InvoicePaymentState } from "../_hooks/use-invoice-payment";
import styles from "./payment-dialog.module.css";

export function PaymentProofField({
  payment,
  hasExistingProof,
}: {
  payment: InvoicePaymentState;
  hasExistingProof: boolean;
}) {
  const isExistingPdf =
    payment.previewUrl && /\.pdf(?:[?#]|$)/i.test(payment.previewUrl);
  return (
    <div className={styles.field}>
      <Label htmlFor="proof-file">
        File Bukti Transfer{" "}
        {hasExistingProof ? (
          "(Opsional)"
        ) : (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        )}
      </Label>
      <p id="proof-file-hint" className={styles.fieldHint}>
        JPG, PNG, WebP, atau PDF · Maksimal 10MB.
        {hasExistingProof &&
          " Bukti sebelumnya tetap digunakan jika tidak diganti."}
      </p>
      <div className={styles.fileChooser}>
        <Upload size={22} aria-hidden="true" />
        <div>
          <p>{payment.selectedFile?.name ?? "Pilih bukti transfer"}</p>
          <span>Pastikan nama pengirim dan nominal terbaca jelas.</span>
        </div>
        <Input
          id="proof-file"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={payment.handleFileChange}
          aria-required={!hasExistingProof}
          aria-invalid={!!payment.fileError}
          aria-describedby={`proof-file-hint${payment.fileError ? " proof-file-error" : ""}`}
          disabled={payment.isBusy}
        />
        <Button
          id="proof-file-button"
          type="button"
          variant="outline"
          size="sm"
          disabled={payment.isBusy}
          onClick={() => document.getElementById("proof-file")?.click()}
          aria-describedby="proof-file-hint"
          aria-invalid={!!payment.fileError}
          aria-errormessage={payment.fileError ? "proof-file-error" : undefined}
        >
          {payment.selectedFile ? "Ganti Dokumen" : "Pilih Dokumen"}
        </Button>
      </div>
      {payment.fileError && (
        <p id="proof-file-error" className={styles.error} role="alert">
          {payment.fileError}
        </p>
      )}
      {payment.previewUrl &&
        (isExistingPdf ? (
          <a
            className={styles.pdfPreview}
            href={payment.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText size={17} aria-hidden="true" />
            Lihat bukti transfer PDF
          </a>
        ) : (
          <div className={styles.preview}>
            <Image
              src={payment.previewUrl}
              alt="Preview bukti transfer"
              fill
              sizes="(max-width: 600px) 80vw, 500px"
              className="object-contain"
            />
          </div>
        ))}
      {payment.selectedFile?.type === "application/pdf" && (
        <p className={styles.pdfPreview}>
          <FileText size={17} aria-hidden="true" />
          <span>{payment.selectedFile.name} (Dokumen PDF)</span>
        </p>
      )}
    </div>
  );
}
