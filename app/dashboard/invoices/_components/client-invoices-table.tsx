"use client";

import { useInvoiceSelection } from "../_hooks/use-invoice-selection";
import type { ClientInvoiceItem } from "../_types/invoice";
import { InvoiceDesktopTable } from "./invoice-desktop-table";
import { InvoiceMobileCards } from "./invoice-mobile-cards";
import { InvoicesEmptyState } from "./invoices-empty-state";
import { UploadProofDialog } from "./upload-proof-dialog";
import styles from "./invoices.module.css";

export type { ClientInvoiceItem } from "../_types/invoice";

export function ClientInvoicesTable({
  invoices,
}: {
  invoices: ClientInvoiceItem[];
}) {
  const {
    selectedInvoice,
    isDialogOpen,
    setIsDialogOpen,
    openUpload,
    restoreFocus,
  } = useInvoiceSelection();
  return (
    <>
      <section
        className={styles.listPanel}
        aria-labelledby="invoice-list-heading"
      >
        <div className={styles.listHeader}>
          <div>
            <p className={styles.stateEyebrow}>Dokumen &amp; pembayaran</p>
            <h2 id="invoice-list-heading">
              Daftar invoice <span>{invoices.length}</span>
            </h2>
          </div>
          <p>Status mengikuti pembaruan sistem.</p>
        </div>
        {invoices.length === 0 ? (
          <InvoicesEmptyState />
        ) : (
          <>
            <InvoiceDesktopTable invoices={invoices} onPay={openUpload} />
            <InvoiceMobileCards invoices={invoices} onPay={openUpload} />
            <p className={styles.listFootnote}>
              Menampilkan seluruh {invoices.length} invoice non-draft.
            </p>
          </>
        )}
      </section>
      {selectedInvoice && (
        <UploadProofDialog
          key={selectedInvoice.id}
          invoice={selectedInvoice}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onReturnFocus={restoreFocus}
        />
      )}
    </>
  );
}
