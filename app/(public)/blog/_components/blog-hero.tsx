import Link from "next/link";
import { ArrowDown, ArrowUpRight, Search } from "lucide-react";
import { PUBLIC_ROUTES } from "@/lib/routes";
import mascot from "@/public/images/blog/aldera-cat-reading.webp";
import { StudioIllustratedHero } from "../../_components/studio-illustrated-hero";
import heroStyles from "../../_components/studio-illustrated-hero.module.css";
import shared from "../../_components/studio.module.css";
import type { BlogListItem } from "../_data/blog-list";

export function BlogHero({
  article,
}: {
  article?: Pick<BlogListItem, "slug" | "title" | "isPinned">;
}) {
  return (
    <StudioIllustratedHero
      headingId="blog-heading"
      label="Blog / Aldera Tech"
      title={
        <>
          Wawasan & <span>cerita</span> dari tim kami
        </>
      }
      description="Artikel tentang pengembangan, desain, dan strategi digital untuk bisnis modern."
      illustration={mascot}
      panelTitle={
        article
          ? article.isPinned
            ? "Artikel disematkan"
            : "Mulai membaca"
          : "Punya topik tertentu?"
      }
      panel={
        article ? (
          <>
            <p className={heroStyles.articleTitle}>{article.title}</p>
            <Link
              href={PUBLIC_ROUTES.blogPost(article.slug)}
              className={heroStyles.panelLink}
              aria-label={`Baca ${article.title}`}
            >
              Baca artikel <ArrowUpRight aria-hidden="true" />
            </Link>
          </>
        ) : (
          <>
            <p className={heroStyles.panelText}>
              Temukan bacaan berdasarkan judul atau kata kunci.
            </p>
            <a href="#blog-search" className={heroStyles.panelLink}>
              Cari artikel <Search aria-hidden="true" />
            </a>
          </>
        )
      }
    >
      <a href="#blog-list-heading" className={shared.blueButton}>
        Jelajahi Artikel
        <ArrowDown className="size-4" aria-hidden="true" />
      </a>
    </StudioIllustratedHero>
  );
}
