import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { InvoicePaymentState } from "../_hooks/use-invoice-payment";
import { PaymentBankAccounts } from "./payment-bank-accounts";
import { PaymentProofField } from "./payment-proof-field";
import styles from "./payment-dialog.module.css";

export function ManualPaymentForm({
  payment,
  hasExistingProof,
  onCancel,
}: {
  payment: InvoicePaymentState;
  hasExistingProof: boolean;
  onCancel: () => void;
}) {
  return (
    <form
      className={styles.manualForm}
      onSubmit={payment.handleSubmitProof}
      aria-busy={payment.isPending || payment.isUploading}
    >
      <PaymentBankAccounts payment={payment} />
      <PaymentProofField
        payment={payment}
        hasExistingProof={hasExistingProof}
      />
      <div className={styles.field}>
        <Label htmlFor="proof-notes">Catatan Pengirim (Opsional)</Label>
        <Textarea
          id="proof-notes"
          placeholder="Contoh: Transfer m-BCA dari rekening a.n. Budi Santoso"
          value={payment.notes}
          onChange={(event) => payment.setNotes(event.target.value)}
          disabled={payment.isBusy}
          rows={2}
        />
      </div>
      {payment.requestError && (
        <p className={styles.error} role="alert">
          {payment.requestError}
        </p>
      )}
      <div className={styles.formActions}>
        <Button
          type="button"
          variant="outline"
          disabled={payment.isBusy}
          onClick={onCancel}
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={payment.isBusy}
          className={styles.primaryButton}
        >
          {payment.isUploading || payment.isPending ? (
            <>
              <Loader2
                className="animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              Mengirim...
            </>
          ) : (
            <>
              <Check aria-hidden="true" />
              Kirim Bukti Pembayaran
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
