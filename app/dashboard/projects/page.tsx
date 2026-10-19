import { Suspense } from "react";
import type { Metadata } from "next";
import { ProjectListHeader } from "./_components/project-list-header";
import { ProjectListSkeleton } from "./_components/project-list-skeleton";
import { ProjectsContent } from "./_components/projects-content";
import styles from "./_components/project-list.module.css";

export const metadata: Metadata = {
  title: "Proyek Saya",
  description: "Pantau semua proyek Anda dengan Aldera Tech.",
};

export interface UserProjectsPageProps {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function UserProjectsPage({
  searchParams,
}: UserProjectsPageProps = {}) {
  const resolvedParams = searchParams ? await searchParams : undefined;

  return (
    <div className={styles.page} aria-labelledby="projects-heading">
      <ProjectListHeader />
      <Suspense fallback={<ProjectListSkeleton />}>
        <ProjectsContent searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}
