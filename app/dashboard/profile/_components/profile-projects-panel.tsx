"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChartNoAxesCombined,
  FolderKanban,
  Monitor,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { formatDate } from "@/lib/utils";
import {
  PROFILE_PREVIEW_LIMITS,
  PROFILE_PREVIEW_PROJECTS,
} from "../_data/profile-preview-data";
import type {
  PreviewProject,
  PreviewResource,
} from "../_types/profile-preview";
import { ProfileDialogContent } from "./profile-dialog";
import {
  DemoBadge,
  PreviewFeedback,
  PreviewPanelHeader,
} from "./profile-preview-primitives";
import styles from "./profile-preview.module.css";

const labels: Record<PreviewProject["status"], string> = {
  IN_PROGRESS: "Dalam pengerjaan",
  REVIEW: "Dalam review",
  COMPLETED: "Selesai",
};
const icons = {
  web: Monitor,
  mobile: Smartphone,
  dashboard: ChartNoAxesCombined,
};
const initial: PreviewResource<PreviewProject> = {
  status: "ready",
  items: PROFILE_PREVIEW_PROJECTS,
};

function ProjectPreview({ project }: { project: PreviewProject }) {
  const Icon = icons[project.kind];
  return (
    <Dialog>
      <article className={styles.projectRow}>
        <div className={styles.projectTop}>
          <span className={styles.projectIcon} aria-hidden="true">
            <Icon size={21} />
          </span>
          <div className={styles.projectCopy}>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
          </div>
          <span className={styles.projectStatus} data-status={project.status}>
            {labels[project.status]}
          </span>
        </div>
        <div className={styles.progressLine}>
          <span>Progres contoh</span>
          <strong>{project.progress}%</strong>
        </div>
        <progress
          className={styles.progress}
          max={100}
          value={project.progress}
          aria-label={`Progres contoh ${project.name}`}
        >
          {project.progress}%
        </progress>
        <div className={styles.projectBottom}>
          <span>
            <CalendarDays size={14} aria-hidden="true" />
            Target{" "}
            {formatDate(project.targetDate, {
              month: "short",
              timeZone: "Asia/Jakarta",
            })}
          </span>
          <DialogTrigger asChild>
            <Button variant="ghost" className={styles.detailButton}>
              Lihat Detail
              <ArrowRight size={15} aria-hidden="true" />
            </Button>
          </DialogTrigger>
        </div>
      </article>
      <ProfileDialogContent
        title={project.name}
        description="Preview proyek demo. Ini bukan data proyek akun Anda."
      >
        <DemoBadge />
        <p className={styles.dialogText}>{project.description}</p>
        <dl className={styles.detailGrid}>
          <div>
            <dt>Status contoh</dt>
            <dd>{labels[project.status]}</dd>
          </div>
          <div>
            <dt>Progres contoh</dt>
            <dd>{project.progress}%</dd>
          </div>
          <div>
            <dt>Tanggal mulai</dt>
            <dd>
              {formatDate(project.startDate, { timeZone: "Asia/Jakarta" })}
            </dd>
          </div>
          <div>
            <dt>Target selesai</dt>
            <dd>
              {formatDate(project.targetDate, { timeZone: "Asia/Jakarta" })}
            </dd>
          </div>
        </dl>
        <h3 className={styles.dialogSubheading}>Ruang lingkup contoh</h3>
        <ul className={styles.deliverables}>
          {project.deliverables.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className={styles.demoNote}>
          Detail ini hanya pratinjau lokal dan tidak membuka ID proyek
          sungguhan.
        </p>
      </ProfileDialogContent>
    </Dialog>
  );
}

export function ProfileProjectsPanel({
  resource = initial,
  onRetry,
}: {
  resource?: PreviewResource<PreviewProject>;
  onRetry?: () => void;
}) {
  const projects =
    resource.status === "ready"
      ? resource.items.slice(0, PROFILE_PREVIEW_LIMITS.projects)
      : [];
  return (
    <section
      className={styles.panel}
      aria-labelledby="profile-projects-heading"
    >
      <PreviewPanelHeader
        id="profile-projects-heading"
        title="Seluruh Proyek Saya"
        icon={FolderKanban}
      />
      <p className={styles.panelDescription}>
        Contoh proyek untuk preview desain. Bukan daftar proyek akun Anda.
      </p>
      {resource.status === "loading" ? (
        <PreviewFeedback status="loading" label="Memuat proyek demo" />
      ) : resource.status === "error" ? (
        <PreviewFeedback
          status="error"
          label="Proyek belum dapat ditampilkan"
          message={resource.message}
          onRetry={onRetry}
        />
      ) : projects.length === 0 ? (
        <PreviewFeedback status="empty" label="Belum ada proyek demo" />
      ) : (
        <div className={styles.projectList}>
          {projects.map((project) => (
            <ProjectPreview project={project} key={project.id} />
          ))}
        </div>
      )}
      {resource.status === "ready" &&
        resource.items.length > PROFILE_PREVIEW_LIMITS.projects && (
          <p className={styles.demoNote}>
            Menampilkan {projects.length} dari {resource.items.length} proyek
            contoh.
          </p>
        )}
      <Button asChild variant="outline" className={styles.actionButton}>
        <Link href={DASHBOARD_ROUTES.projects}>
          Lihat Semua Proyek
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </Button>
    </section>
  );
}
