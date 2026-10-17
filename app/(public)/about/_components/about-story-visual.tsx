import Image from "next/image";
import { Eye, FileText, Flag, LayoutDashboard } from "lucide-react";
import workflow from "@/public/images/about/aldera-story-workflow.webp";
import styles from "./about-story.module.css";

export function AboutStoryVisual() {
  return (
    <div className={styles.visual} aria-hidden="true">
      <div className={styles.visualHeader}>
        <span>
          <Eye className="size-4" strokeWidth={1.5} />
        </span>
        Transparansi radikal
      </div>
      <div className={styles.canvas}>
        <span className={styles.visualOrbit} />
        <span className={styles.visualShadow} />
        <div className={styles.artwork}>
          <Image
            src={workflow}
            alt=""
            fill
            quality={90}
            sizes="(min-width: 1280px) 520px, (min-width: 768px) 42vw, 90vw"
            className={styles.image}
          />
        </div>
      </div>
      <div className={styles.visualFooter}>
        <span>
          <LayoutDashboard className="size-4" strokeWidth={1.5} />
          Dashboard
        </span>
        <span>
          <Flag className="size-4" strokeWidth={1.5} />
          Milestone
        </span>
        <span>
          <FileText className="size-4" strokeWidth={1.5} />
          Invoice
        </span>
      </div>
    </div>
  );
}
