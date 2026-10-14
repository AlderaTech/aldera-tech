import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { ClientInvoicesTable } from "./_components/client-invoices-table";

export default async function UserInvoicesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const rawInvoices = await safeDb(
    async () =>
      await prisma.invoice.findMany({
        where: { clientId: userId },
        orderBy: { issueDate: "desc" },
        include: { project: { select: { title: true } } },
      }),
    []
  );

  const serializedInvoices = rawInvoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    status: inv.status,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    total: Number(inv.total),
    paymentProofUrl: inv.paymentProofUrl,
    project: inv.project ? { title: inv.project.title } : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight xxxl:text-3xl">
          Invoice
        </h1>
        <p className="text-muted-foreground">
          Semua tagihan Anda, transparan, bisa diunduh sebagai PDF, dan
          konfirmasi bukti pembayaran.
        </p>
      </div>

      <ClientInvoicesTable invoices={serializedInvoices} />
    </div>
  );
}
