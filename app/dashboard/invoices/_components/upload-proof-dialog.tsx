"use client";

import { CreditCard, Landmark, ReceiptText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import chrome from "@/components/dashboard/overview-chrome.module.css";
import { useInvoicePayment } from "../_hooks/use-invoice-payment";
import type { PaymentInvoice } from "../_types/invoice";
import { OnlinePaymentPanel } from "./online-payment-panel";
import { ManualPaymentForm } from "./manual-payment-form";
import styles from "./payment-dialog.module.css";

export type UploadProofDialogProps = {
  invoice: PaymentInvoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReturnFocus?: () => void;
};

export function UploadProofDialog({
  invoice,
  open,
  onOpenChange,
  onReturnFocus,
}: UploadProofDialogProps) {
  const payment = useInvoicePayment(invoice, onOpenChange);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(chrome.scope, styles.dialog)}
        onCloseAutoFocus={(event) => {
          if (onReturnFocus) {
            event.preventDefault();
            onReturnFocus();
          }
        }}
      >
        <DialogHeader className={styles.header}>
          <span className={styles.headerIcon} aria-hidden="true">
            <ReceiptText size={21} />
          </span>
          <DialogTitle>Pembayaran Tagihan</DialogTitle>
          <DialogDescription>
            Pilih metode pembayaran untuk invoice{" "}
            <strong>{invoice.number}</strong>.
          </DialogDescription>
        </DialogHeader>
        <dl className={styles.invoiceSummary}>
          <div>
            <dt>Total tagihan</dt>
            <dd>{formatCurrency(invoice.total)}</dd>
          </div>
          <div>
            <dt>Jatuh tempo</dt>
            <dd>{formatDate(invoice.dueDate, { month: "short" })}</dd>
          </div>
        </dl>
        <Tabs
          value={payment.activeTab}
          onValueChange={payment.setActiveTab}
          className={styles.tabs}
        >
          <TabsList className={styles.tabsList}>
            <TabsTrigger value="midtrans" disabled={payment.isBusy}>
              <CreditCard aria-hidden="true" />
              <span>
                Bayar Online{" "}
                <span className={styles.tabProvider}>(Midtrans)</span>
              </span>
            </TabsTrigger>
            <TabsTrigger value="manual" disabled={payment.isBusy}>
              <Landmark aria-hidden="true" />
              Transfer Manual
            </TabsTrigger>
          </TabsList>
          <TabsContent value="midtrans">
            <OnlinePaymentPanel payment={payment} />
          </TabsContent>
          <TabsContent value="manual">
            <ManualPaymentForm
              payment={payment}
              hasExistingProof={!!invoice.paymentProofUrl}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
