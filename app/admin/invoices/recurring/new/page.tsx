import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROUTES } from "@/lib/routes";
import { safeDb } from "@/lib/safe-db";
import { RecurringTemplateForm } from "../_components/recurring-form";

export default async function NewRecurringPage() {
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
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href={ADMIN_ROUTES.invoicesRecurring}>← Kembali</Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Template Baru</h1>
        <p className="text-muted-foreground">
          Invoice akan otomatis diterbitkan sesuai jadwal.
        </p>
      </div>
      <RecurringTemplateForm clients={clients} projects={projects} />
    </div>
  );
}
