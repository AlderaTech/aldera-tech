import type { Prisma, Project, ProjectStatus } from "@prisma/client";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/shared/data-pagination";
import { ProjectCard } from "./project-card";
import { ProjectFilters } from "./project-filters";
import { ProjectsEmptyState } from "./projects-empty-state";
import { ProjectsLoadError } from "./projects-load-error";
import styles from "./project-list.module.css";

const PROJECTS_PER_PAGE = 6;

const VALID_PROJECT_STATUSES: readonly ProjectStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
  "CANCELLED",
];

export interface ProjectsContentProps {
  searchParams?: {
    q?: string;
    status?: string;
    page?: string;
  };
}

export async function ProjectsContent({
  searchParams,
}: ProjectsContentProps = {}) {
  const session = await auth();
  const userId = session!.user.id;

  const query = searchParams?.q?.trim();
  const rawStatus = searchParams?.status?.trim().toUpperCase();
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);

  const statusFilter =
    rawStatus && VALID_PROJECT_STATUSES.includes(rawStatus as ProjectStatus)
      ? (rawStatus as ProjectStatus)
      : undefined;

  const hasFilter = Boolean(query || statusFilter);

  const where: Prisma.ProjectWhereInput = {
    clientId: userId,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(query
      ? {
          title: {
            contains: query,
            mode: "insensitive",
          },
        }
      : {}),
  };

  const result = await safeDb<{ total: number; items: Project[] } | null>(
    async () => {
      const [total, items] = await Promise.all([
        prisma.project.count({ where }),
        prisma.project.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          skip: (page - 1) * PROJECTS_PER_PAGE,
          take: PROJECTS_PER_PAGE,
        }),
      ]);
      return { total, items };
    },
    null
  );

  if (result === null) return <ProjectsLoadError />;

  const { total, items: projects } = result;

  if (total === 0 && !hasFilter) {
    return <ProjectsEmptyState />;
  }

  return (
    <div className="space-y-6">
      <ProjectFilters />

      <div className={styles.listBar}>
        <h2 id="projects-list-heading">
          Daftar proyek <span>{total}</span>
        </h2>
        <p>Urutan pembaruan terbaru</p>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/50 p-10 text-center shadow-xs">
          <p className="text-sm font-medium text-foreground">
            Tidak ada proyek yang sesuai dengan kriteria filter.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Coba ubah kata kunci pencarian atau status filter.
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mt-4 gap-1.5 text-xs"
          >
            <Link href={DASHBOARD_ROUTES.projects}>
              <RotateCcw className="size-3.5" />
              Reset Filter
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <ul className={styles.grid} aria-labelledby="projects-list-heading">
            {projects.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>

          <DataPagination
            currentPage={page}
            totalItems={total}
            pageSize={PROJECTS_PER_PAGE}
            className="mt-6"
          />
        </>
      )}
    </div>
  );
}
