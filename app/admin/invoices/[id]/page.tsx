import { notFound } from "next/navigation";

import { InvoiceDetailHeader } from "./_components/invoice-detail-header";
import { InvoiceLineItems } from "./_components/invoice-line-items";
import { InvoiceSidePanel } from "./_components/invoice-side-panel";
import { InvoiceStatusControls } from "./_components/invoice-status-controls";
import { getInvoiceDetail } from "./_data/invoice-detail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const invoice = await getInvoiceDetail(id);

  if (!invoice) notFound();

  return (
    <div className="space-y-5">
      <InvoiceDetailHeader invoice={invoice} />
      <InvoiceStatusControls invoiceId={invoice.id} status={invoice.status} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <InvoiceLineItems invoice={invoice} />
        <InvoiceSidePanel invoice={invoice} />
      </div>
    </div>
  );
}
