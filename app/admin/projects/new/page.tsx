import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Proyek Baru</h1>
        <p className="text-muted-foreground">
          Buat proyek dan assign ke client.
        </p>
      </div>
      <ProjectCreateForm clients={clients} />
    </div>
  );
}
