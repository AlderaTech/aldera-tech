import { Suspense } from "react";
import type { Metadata } from "next";
import { InvoicesContent } from "./_components/invoices-content";
import { InvoicesFrame } from "./_components/invoices-frame";
import { InvoicesSkeleton } from "./_components/invoices-skeleton";

export const metadata: Metadata = {
  title: "Invoice & Pembayaran",
  description: "Pantau invoice dan pembayaran proyek Anda di Aldera Tech.",
};

export default function UserInvoicesPage() {
  return (
    <InvoicesFrame>
      <Suspense fallback={<InvoicesSkeleton />}>
        <InvoicesContent />
      </Suspense>
    </InvoicesFrame>
  );
}
