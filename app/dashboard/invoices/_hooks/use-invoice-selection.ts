"use client";

import { useRef, useState } from "react";
import type { ClientInvoiceItem } from "../_types/invoice";

export function useInvoiceSelection() {
  const [selectedInvoice, setSelectedInvoice] =
    useState<ClientInvoiceItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const paymentTrigger = useRef<HTMLElement | null>(null);
  function openUpload(invoice: ClientInvoiceItem) {
    paymentTrigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setSelectedInvoice(invoice);
    setIsDialogOpen(true);
  }
  function restoreFocus() {
    paymentTrigger.current?.focus();
  }
  return {
    selectedInvoice,
    isDialogOpen,
    setIsDialogOpen,
    openUpload,
    restoreFocus,
  };
}
