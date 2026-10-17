import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PUBLIC_ROUTES } from "@/lib/routes";
import type { TechStackCategory } from "../_utils/group-tech-stack";
import { getTechStackArtwork } from "../_constants/tech-stack-artwork";
import {
  getCategoryVisual,
  getToolIcon,
} from "../_constants/tech-stack-visuals";
import styles from "./tech-stack.module.css";

type Tool = { name: string; category: string; icon?: string | null };

export function TechStackCard({
  category,
  tools,
  featured = false,
  position,
}: {
  category: TechStackCategory;
  tools: Tool[];
  featured?: boolean;
  position: number;
}) {
  const { icon: CategoryIcon, description } = getCategoryVisual(category);

  return (
    <article className={cn(styles.card, featured && styles.featured)}>
      <div className={styles.cardHeader}>
        <span className={styles.categoryIndex} aria-hidden="true">
          <CategoryIcon className="size-4" strokeWidth={1.5} />
          <span />
          {String(position).padStart(2, "0")}
        </span>
        {tools.length > 0 && (
          <span className={styles.count}>
            <span aria-hidden="true" />
            {tools.length} alat
          </span>
        )}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardCopy}>
          <h3>{category}</h3>
          <p className={styles.categoryDescription}>{description}</p>
        </div>
        <div className={styles.artwork} aria-hidden="true">
          <span className={styles.artworkOrbit} />
          <Image
            src={getTechStackArtwork(category)}
            alt=""
            fill
            quality={90}
            sizes="(max-width: 639px) 88px, (max-width: 1023px) 96px, 104px"
            className={styles.artworkImage}
          />
        </div>
      </div>
      {tools.length > 0 ? (
        <ul className={styles.tools} aria-label={`Teknologi ${category}`}>
          {tools.map((tool, index) => {
            const ToolIcon = getToolIcon(tool.name, tool.icon);
            return (
              <li key={`${tool.category}:${tool.name}:${index}`}>
                <ToolIcon
                  className="size-4 shrink-0"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <span>{tool.name}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={styles.tools}>
          {category === "AI/LLM" ? (
            <Link href={PUBLIC_ROUTES.aiRelay} className={styles.categoryLink}>
              Jelajahi AI Relay
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          ) : (
            <p className={styles.emptyTools}>Daftar alat belum tersedia.</p>
          )}
        </div>
      )}
    </article>
  );
}
