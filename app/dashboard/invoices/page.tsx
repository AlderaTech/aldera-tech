import { Suspense } from "react";
import type { Metadata } from "next";
import { InvoicesContent } from "./_components/invoices-content";
import { InvoicesFrame } from "./_components/invoices-frame";
import { InvoicesSkeleton } from "./_components/invoices-skeleton";

export const metadata: Metadata = {
  title: "Invoice & Pembayaran",
  description: "Pantau invoice dan pembayaran proyek Anda di Aldera Tech.",
};

export interface UserInvoicesPageProps {
  searchParams?: Promise<{
    status?: string;
    page?: string;
  }>;
}

export default async function UserInvoicesPage({
  searchParams,
}: UserInvoicesPageProps = {}) {
  const resolvedParams = searchParams ? await searchParams : undefined;

  return (
    <InvoicesFrame>
      <Suspense fallback={<InvoicesSkeleton />}>
        <InvoicesContent searchParams={resolvedParams} />
      </Suspense>
    </InvoicesFrame>
  );
}
