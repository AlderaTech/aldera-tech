import { Download, FileText, FolderOpen } from "lucide-react";

import { FileUploader } from "@/components/dashboard/file-uploader";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import styles from "./project-detail.module.css";

export interface ProjectFileItem {
  id: string;
  originalName: string;
  size: number;
  createdAt: Date;
  url: string;
}

interface ProjectFilesTabProps {
  projectId: string;
  files: ProjectFileItem[];
}

export function ProjectFilesTab({ projectId, files }: ProjectFilesTabProps) {
  return (
    <section className={styles.panel} aria-labelledby="project-files-heading">
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>
            <FolderOpen className="size-3.5" aria-hidden="true" /> Dokumen &amp;
            Deliverable
          </p>
          <h2 id="project-files-heading" className={styles.panelTitle}>
            Berkas Proyek
          </h2>
          <p className={styles.panelSubtitle}>
            Unggah dokumen kebutuhan atau unduh hasil deliverable proyek Anda.
          </p>
        </div>
        <span className={styles.countBadge}>{files.length} Berkas</span>
      </div>

      <div className="space-y-4">
        <FileUploader projectId={projectId} />

        {files.length === 0 ? (
          <div className={styles.emptyBox}>Belum ada file.</div>
        ) : (
          <div className={styles.itemGrid}>
            {files.map((f) => (
              <div key={f.id} className={styles.itemCard}>
                <div className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#e1e8f2] bg-[#e8f0ff] text-[#245fe5]">
                    <FileText className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-[#102651]">
                      {f.originalName}
                    </div>
                    <div className="mt-0.5 text-xs font-medium text-[#65748b]">
                      {(f.size / 1024).toFixed(1)} KB ·{" "}
                      {formatDate(f.createdAt)}
                    </div>
                  </div>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full border-[#e1e8f2] bg-[#f5f8fd] font-semibold text-[#102651] hover:border-[#245fe5] hover:bg-[#e8f0ff] hover:text-[#245fe5]"
                >
                  <a href={f.url} download={f.originalName}>
                    <Download className="size-3.5" /> Download
                  </a>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
