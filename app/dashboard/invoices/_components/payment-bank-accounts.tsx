import { Check, Copy, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BANK_ACCOUNTS } from "../_data/bank-accounts";
import type { InvoicePaymentState } from "../_hooks/use-invoice-payment";
import styles from "./payment-dialog.module.css";

export function PaymentBankAccounts({
  payment,
}: {
  payment: InvoicePaymentState;
}) {
  return (
    <section className={styles.bankSection} aria-label="Rekening transfer">
      <p className={styles.sectionLabel}>
        Rekening resmi PT Aldera Solusindo Mandiri
      </p>
      {BANK_ACCOUNTS.map((account) => (
        <div className={styles.bankAccount} key={account.bank}>
          <Landmark size={18} aria-hidden="true" />
          <div>
            <h3>{account.bank}</h3>
            <p className={styles.accountNumber}>{account.displayNumber}</p>
            <p>a.n. {account.accountName}</p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() =>
              payment.handleCopy(account.accountNumber, account.bank)
            }
            aria-label={`Salin nomor rekening ${account.bank}`}
          >
            {payment.copiedBank === account.bank ? (
              <Check aria-hidden="true" />
            ) : (
              <Copy aria-hidden="true" />
            )}
            <span>
              {payment.copiedBank === account.bank ? "Tersalin" : "Salin"}
            </span>
          </Button>
        </div>
      ))}
    </section>
  );
}
