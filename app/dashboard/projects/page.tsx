import Link from "next/link";
import { ArrowRight, Calendar, FolderKanban } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { formatDate } from "@/lib/utils";
import { projectStatusMeta } from "@/lib/status-meta";
import { DASHBOARD_ROUTES } from "@/lib/routes";

export default async function UserProjectsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const projects = await safeDb(
    async () =>
      await prisma.project.findMany({
        where: { clientId: userId },
        orderBy: { updatedAt: "desc" },
      }),
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight xxxl:text-3xl">
          Proyek Saya
        </h1>
        <p className="text-muted-foreground">
          Pantau semua proyek Anda dengan Aldera Tech.
        </p>
      </div>

      {projects.length === 0 ? (
        <Card className="flex flex-col items-center p-12 text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
            <FolderKanban className="size-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Belum ada proyek</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Hitung estimasi harga dan ajukan proyek Anda melalui kalkulator.
          </p>
          <Button asChild className="mt-5">
            <Link href={DASHBOARD_ROUTES.calculator}>Hitung Estimasi</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => {
            const meta = projectStatusMeta[p.status];
            return (
              <Link
                key={p.id}
                href={DASHBOARD_ROUTES.projectDetail(p.id)}
                className="group block"
              >
                <Card className="h-full p-5 transition-all hover:border-primary/50 hover:shadow-lg">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h2 className="leading-snug font-semibold transition-colors group-hover:text-primary">
                      {p.title}
                    </h2>
                    <Badge variant={meta.variant} className="shrink-0">
                      {meta.label}
                    </Badge>
                  </div>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                  <div className="space-y-3">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progres</span>
                        <span className="font-medium tabular-nums">
                          {p.progress}%
                        </span>
                      </div>
                      <Progress value={p.progress} />
                    </div>
                    {p.deadline && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        {formatDate(p.deadline)}
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-1 text-sm text-primary transition-all group-hover:gap-2">
                      Detail <ArrowRight className="size-3.5" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
