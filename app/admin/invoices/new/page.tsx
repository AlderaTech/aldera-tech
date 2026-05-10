import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { InvoiceCreateForm } from "../_components/invoice-create-form";

export default async function NewInvoicePage() {
  const [clients, projects] = await Promise.all([
    safeDb(
      async () =>
        await prisma.user.findMany({
          where: { role: "CLIENT", isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, email: true },
        }),
      []
    ),
    safeDb(
      async () =>
        await prisma.project.findMany({
          orderBy: { title: "asc" },
          select: { id: true, title: true, clientId: true },
        }),
      []
    ),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invoice Baru</h1>
        <p className="text-muted-foreground">
          Buat invoice untuk client Anda. Nomor akan auto-generate.
        </p>
      </div>
      <InvoiceCreateForm clients={clients} projects={projects} />
    </div>
  );
}
