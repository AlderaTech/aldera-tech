import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { formatDate } from "@/lib/utils";
import { projectStatusMeta } from "@/lib/status-meta";

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
        <h1 className="text-2xl xxxl:text-3xl font-bold tracking-tight">
          Proyek Saya
        </h1>
        <p className="text-muted-foreground">
          Pantau semua proyek Anda dengan Solvo Tech.
        </p>
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          Belum ada proyek. Hubungi tim kami untuk memulai.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => {
            const meta = projectStatusMeta[p.status];
            return (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="block group">
                <Card className="h-full p-5 hover:border-primary/50 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="font-semibold leading-snug group-hover:text-primary transition-colors">
                      {p.title}
                    </h2>
                    <Badge variant={meta.variant} className="shrink-0">
                      {meta.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {p.description}
                  </p>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progres</span>
                        <span className="tabular-nums font-medium">
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
                    <div className="flex items-center justify-end text-sm text-primary gap-1 group-hover:gap-2 transition-all">
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
