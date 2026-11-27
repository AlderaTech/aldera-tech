import Link from "next/link";
import { ArrowUpRight, FolderKanban } from "lucide-react";
import { WorkspaceBanner } from "@/components/dashboard/workspace-banner";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/lib/routes";
import styles from "./project-list.module.css";

export function ProjectListHeader() {
  return (
    <WorkspaceBanner
      className={styles.header}
      eyebrow="Proyek Anda"
      badgeIcon={FolderKanban}
      mascotPose="projects"
    >
      <div>
        <h1 id="projects-heading">Proyek Saya</h1>
        <p className={styles.description}>
          Pantau semua proyek Anda dengan Aldera Tech.
        </p>
      </div>
      <Button asChild className={styles.primaryButton}>
        <Link href={PUBLIC_ROUTES.calculator}>
          Hitung Estimasi <ArrowUpRight aria-hidden="true" />
        </Link>
      </Button>
    </WorkspaceBanner>
  );
}
