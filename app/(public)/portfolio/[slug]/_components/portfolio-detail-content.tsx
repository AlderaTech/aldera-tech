import { Code2, Lightbulb, Target, TrendingUp } from "lucide-react";
import { FadeUp } from "@/components/shared/motion";
import { cn } from "@/lib/utils";
import shared from "../../../_components/studio.module.css";
import type { PortfolioDetail } from "../../_data/portfolio";
import styles from "./portfolio-detail.module.css";

type PortfolioDetailContentProps = {
  item: PortfolioDetail;
};

export function PortfolioDetailContent({ item }: PortfolioDetailContentProps) {
  const sections = [
    { icon: Target, title: "Tantangan", text: item.challenge },
    { icon: Lightbulb, title: "Solusi", text: item.solution },
    { icon: TrendingUp, title: "Hasil", text: item.result },
  ];

  return (
    <section className={styles.details} aria-labelledby="case-story-heading">
      <div className={shared.container}>
        <FadeUp className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Cerita proyek</p>
          <h2 id="case-story-heading">
            Di balik <span>proyek ini.</span>
          </h2>
        </FadeUp>
        <div
          className={cn(
            styles.contentGrid,
            !item.techStack.length && styles.textOnly
          )}
        >
          <div className={styles.story}>
            {sections.map((section, index) => (
              <FadeUp key={section.title}>
                <article
                  className={cn(
                    styles.storyCard,
                    index === 2 && styles.resultCard
                  )}
                >
                  <header className={styles.cardHeader}>
                    <span className={styles.storyIcon} aria-hidden="true">
                      <section.icon className="size-5" strokeWidth={1.6} />
                    </span>
                    <h3>{section.title}</h3>
                    <span className={styles.stepIndex} aria-hidden="true">
                      / {String(index + 1).padStart(2, "0")}
                    </span>
                  </header>
                  <p>{section.text}</p>
                </article>
              </FadeUp>
            ))}
          </div>
          {item.techStack.length > 0 && (
            <aside
              className={styles.techAside}
              aria-labelledby="case-tech-heading"
            >
              <FadeUp className={styles.techPanel}>
                <span className={styles.techIcon} aria-hidden="true">
                  <Code2 className="size-6" strokeWidth={1.5} />
                </span>
                <p className={styles.eyebrow}>Stack proyek</p>
                <h3 id="case-tech-heading">Teknologi</h3>
                <div className={styles.techStack}>
                  {item.techStack.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                </div>
              </FadeUp>
            </aside>
          )}
        </div>
      </div>
    </section>
  );
}
