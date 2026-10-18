import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/lib/routes";
import styles from "./project-list.module.css";

export function ProjectListHeader() {
  return (
    <div className={styles.header}>
      <div>
        <p className={styles.eyebrow}>Ruang kolaborasi</p>
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
    </div>
  );
}
