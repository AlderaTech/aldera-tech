import { AdminBanner } from "@/app/admin/_components/admin-banner";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { AdminMascot } from "../../_components/admin-mascot";
import { ProjectCreateForm } from "../_components/project-create-form";

export default async function NewProjectPage() {
  const clients = await safeDb(
    async () =>
      await prisma.user.findMany({
        where: { roles: { has: "CLIENT" }, isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, email: true },
      }),
    []
  );

  return (
    <div className="space-y-6">
      <AdminBanner
        data-admin-page-header
        className="flex flex-wrap items-center justify-between gap-4"
        category="projects"
        mascot={<AdminMascot pose="guide" size="header" />}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proyek Baru</h1>
          <p className="text-muted-foreground">
            Buat proyek baru dan tentukan klien yang akan menggunakannya.
          </p>
        </div>
      </AdminBanner>
      <ProjectCreateForm clients={clients} />
    </div>
  );
}
