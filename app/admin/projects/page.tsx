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
import { ProjectStatus, type Prisma } from "@prisma/client";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { DataPagination } from "@/components/shared/data-pagination";
import { ParamFilterSelect } from "@/components/shared/param-filter-select";

const statusFilterOptions = [
  { label: "Semua Status", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Review", value: "REVIEW" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export interface AdminProjectsPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function AdminProjectsList({
  searchParams,
}: AdminProjectsPageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page) || 1);
  const PAGE_SIZE = 10;
  const q = sp?.q?.trim();
  const rawStatus = sp?.status?.trim()?.toUpperCase();
  const sort = sp?.sort?.trim();

  const where: Prisma.ProjectWhereInput = {};
  if (
    rawStatus &&
    rawStatus !== "ALL" &&
    Object.values(ProjectStatus).includes(rawStatus as ProjectStatus)
  ) {
    where.status = rawStatus as ProjectStatus;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  let orderBy: Prisma.ProjectOrderByWithRelationInput = { updatedAt: "desc" };
  if (sort === "budget_desc") orderBy = { budget: "desc" };
  else if (sort === "budget_asc") orderBy = { budget: "asc" };
  else if (sort === "deadline_asc") orderBy = { deadline: "asc" };
  else if (sort === "title_asc") orderBy = { title: "asc" };

  const [projects, totalCount] = await safeDb(
    async () =>
      await Promise.all([
        prisma.project.findMany({
          where,
          orderBy,
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          include: { client: { select: { name: true } } },
        }),
        prisma.project.count({ where }),
      ]),
    [[], 0]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
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

      <SearchFilterBar
        placeholder="Cari judul proyek atau nama client..."
        searchParamKey="q"
      >
        <ParamFilterSelect
          paramKey="status"
          options={statusFilterOptions}
          placeholder="Filter status..."
        />
      </SearchFilterBar>

      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead className="hidden md:table-cell">Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden w-40 lg:table-cell">
                Progres
              </TableHead>
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
                  className="py-10 text-center text-muted-foreground"
                >
                  Belum ada proyek atau tidak ada proyek yang sesuai kriteria.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p) => {
                const meta = projectStatusMeta[p.status];
                return (
                  <TableRow key={p.id}>
                    <TableCell className="max-w-xs truncate font-medium">
                      {p.title}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                      {p.client.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <Progress value={p.progress} className="w-24" />
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {p.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
                      {p.deadline ? formatDate(p.deadline) : "-"}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground xl:table-cell">
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

        <DataPagination
          currentPage={page}
          totalItems={totalCount}
          pageSize={PAGE_SIZE}
        />
      </Card>
    </div>
  );
}
