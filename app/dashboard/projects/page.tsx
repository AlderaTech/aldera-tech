import { Suspense } from "react";
import { ProjectListHeader } from "./_components/project-list-header";
import { ProjectListSkeleton } from "./_components/project-list-skeleton";
import { ProjectsContent } from "./_components/projects-content";
import styles from "./_components/project-list.module.css";

export default function UserProjectsPage() {
  return (
    <div className={styles.page} aria-labelledby="projects-heading">
      <ProjectListHeader />
      <Suspense fallback={<ProjectListSkeleton />}>
        <ProjectsContent />
      </Suspense>
    </div>
  );
}
