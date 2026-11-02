import { AdminBanner } from "@/app/admin/_components/admin-banner";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { AdminMascot } from "../../_components/admin-mascot";
import { InvoiceCreateForm } from "../_components/invoice-create-form";

export default async function NewInvoicePage() {
  const [clients, projects] = await Promise.all([
    safeDb(
      async () =>
        await prisma.user.findMany({
          where: { roles: { has: "CLIENT" }, isActive: true },
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
      <AdminBanner
        data-admin-page-header
        className="flex flex-wrap items-center justify-between gap-4"
        category="billing"
        mascot={<AdminMascot pose="services" size="header" />}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoice Baru</h1>
          <p className="text-muted-foreground">
            Buat tagihan untuk klien Anda dengan nomor invoice yang diterbitkan
            otomatis.
          </p>
        </div>
      </AdminBanner>
      <InvoiceCreateForm clients={clients} projects={projects} />
    </div>
  );
}
