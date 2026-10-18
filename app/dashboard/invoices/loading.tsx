import { InvoicesFrame } from "./_components/invoices-frame";
import { InvoicesSkeleton } from "./_components/invoices-skeleton";

export default function Loading() {
  return (
    <InvoicesFrame>
      <InvoicesSkeleton />
    </InvoicesFrame>
  );
}
