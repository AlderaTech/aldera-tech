import {
  CreditCard,
  ExternalLink,
  Loader2,
  QrCode,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InvoicePaymentState } from "../_hooks/use-invoice-payment";
import styles from "./payment-dialog.module.css";

export function OnlinePaymentPanel({
  payment,
}: {
  payment: InvoicePaymentState;
}) {
  return (
    <div className={styles.onlinePanel}>
      <div className={styles.methodIntro}>
        <span>
          <ShieldCheck size={21} aria-hidden="true" />
        </span>
        <div>
          <h3>Pembayaran melalui Midtrans</h3>
          <p>
            Pilih metode pembayaran di halaman Midtrans. Status invoice
            mengikuti konfirmasi dari sistem.
          </p>
        </div>
      </div>
      <div className={styles.methods}>
        {[
          { label: "QRIS", icon: QrCode },
          { label: "Kartu Kredit", icon: CreditCard },
          { label: "E-Wallet", icon: Wallet },
        ].map(({ label, icon: Icon }) => (
          <span key={label}>
            <Icon size={16} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
      <p className={styles.methodNote}>
        Virtual Account BCA, Mandiri, BRI, BNI, Permata, GoPay, dan ShopeePay.
      </p>
      {payment.requestError && (
        <p className={styles.error} role="alert">
          {payment.requestError}
        </p>
      )}
      <Button
        type="button"
        disabled={payment.isBusy}
        onClick={payment.handleMidtransPayment}
        className={styles.primaryButton}
      >
        {payment.isStartingMidtrans ? (
          <>
            <Loader2
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            Menyiapkan pembayaran...
          </>
        ) : (
          <>
            <ExternalLink aria-hidden="true" />
            Bayar Sekarang via Midtrans
          </>
        )}
      </Button>
    </div>
  );
}
