import Link from "next/link";
import { Plus, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROUTES, API_ROUTES } from "@/lib/routes";
import { safeDb } from "@/lib/safe-db";
import { formatDate, formatCurrency } from "@/lib/utils";
import { projectStatusMeta } from "@/lib/status-meta";

export default async function AdminProjectsList() {
  const projects = await safeDb(
    async () =>
      await prisma.project.findMany({
        orderBy: { updatedAt: "desc" },
        include: { client: { select: { name: true, company: true } } },
      }),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proyek</h1>
          <p className="text-muted-foreground">
            Manage semua proyek yang sedang berjalan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <a href={API_ROUTES.exportProjects} download>
              <Download className="size-4" /> Export CSV
            </a>
          </Button>
          <Button asChild>
            <Link href={ADMIN_ROUTES.projectNew}>
              <Plus className="size-4" /> Proyek Baru
            </Link>
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead className="hidden md:table-cell">Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-40 hidden lg:table-cell">Progres</TableHead>
              <TableHead className="hidden xl:table-cell">Deadline</TableHead>
              <TableHead className="hidden xl:table-cell">Budget</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground py-10"
                >
                  Belum ada proyek.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p) => {
                const meta = projectStatusMeta[p.status];
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {p.title}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      <div className="flex flex-col">
                        <span className="text-sm">{p.client.name}</span>
                        {p.client.company && (
                          <span className="text-xs text-muted-foreground">
                            {p.client.company}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Progress value={p.progress} className="w-24" />
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {p.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground text-sm">
                      {p.deadline ? formatDate(p.deadline) : "-"}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground text-sm">
                      {p.budget ? formatCurrency(Number(p.budget)) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={ADMIN_ROUTES.projectDetail(p.id)}>
                          Detail
                          <ExternalLink className="size-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
