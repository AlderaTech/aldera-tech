import type { Project } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { ProjectCard } from "./project-card";
import { ProjectsEmptyState } from "./projects-empty-state";
import { ProjectsLoadError } from "./projects-load-error";
import styles from "./project-list.module.css";

export async function ProjectsContent() {
  const session = await auth();
  const userId = session!.user.id;

  const projects = await safeDb<Project[] | null>(
    async () =>
      await prisma.project.findMany({
        where: { clientId: userId },
        orderBy: { updatedAt: "desc" },
      }),
    null
  );

  if (projects === null) return <ProjectsLoadError />;
  if (projects.length === 0) return <ProjectsEmptyState />;

  return (
    <div>
      <div className={styles.listBar}>
        <h2 id="projects-list-heading">
          Daftar proyek <span>{projects.length}</span>
        </h2>
        <p>Urutan pembaruan terbaru</p>
      </div>
      <ul className={styles.grid} aria-labelledby="projects-list-heading">
        {projects.map((project) => (
          <li key={project.id}>
            <ProjectCard project={project} />
          </li>
        ))}
      </ul>
    </div>
  );
}
