"use client";

import { useInvoiceSelection } from "../_hooks/use-invoice-selection";
import type { ClientInvoiceItem } from "../_types/invoice";
import { InvoiceDesktopTable } from "./invoice-desktop-table";
import { InvoiceMobileCards } from "./invoice-mobile-cards";
import { InvoicesEmptyState } from "./invoices-empty-state";
import { InvoiceStatusFilter } from "./invoice-status-filter";
import { DataPagination } from "@/components/shared/data-pagination";
import { UploadProofDialog } from "./upload-proof-dialog";
import styles from "./invoices.module.css";

export type { ClientInvoiceItem } from "../_types/invoice";

export interface ClientInvoicesTableProps {
  invoices: ClientInvoiceItem[];
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
}

export function ClientInvoicesTable({
  invoices,
  totalItems,
  currentPage = 1,
  pageSize = 10,
}: ClientInvoicesTableProps) {
  const {
    selectedInvoice,
    isDialogOpen,
    setIsDialogOpen,
    openUpload,
    restoreFocus,
  } = useInvoiceSelection();

  const total = totalItems ?? invoices.length;

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
              Daftar invoice <span>{total}</span>
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <InvoiceStatusFilter />
          </div>
        </div>
        {invoices.length === 0 ? (
          <InvoicesEmptyState />
        ) : (
          <>
            <InvoiceDesktopTable invoices={invoices} onPay={openUpload} />
            <InvoiceMobileCards invoices={invoices} onPay={openUpload} />
            {totalItems !== undefined ? (
              <DataPagination
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
              />
            ) : (
              <p className={styles.listFootnote}>
                Menampilkan seluruh {invoices.length} invoice non-draft.
              </p>
            )}
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
