import type { InvoiceStatus } from "@prisma/client";

export type ClientInvoiceItem = {
  id: string;
  number: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  total: number;
  paymentProofUrl: string | null;
  project: { title: string } | null;
};

export type PaymentInvoice = Pick<
  ClientInvoiceItem,
  "id" | "number" | "total"
> & {
  dueDate: Date | string;
  paymentProofUrl?: string | null;
};
