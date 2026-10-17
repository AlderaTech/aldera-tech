import { Code2, Layers3, MessagesSquare, Orbit } from "lucide-react";
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import { cn } from "@/lib/utils";
import shared from "../studio.module.css";
import styles from "./home-summary.module.css";

const strengths = [
  {
    icon: Code2,
    title: "Rekayasa yang terarah",
    description: "Website & aplikasi sesuai kebutuhan bisnis.",
  },
  {
    icon: Layers3,
    title: "Proses yang terstruktur",
    description: "Scope, sprint, dan handoff yang jelas.",
  },
  {
    icon: MessagesSquare,
    title: "Kolaborasi transparan",
    description: "Progres yang dapat Anda ikuti.",
  },
];

export function HomeSummary() {
  return (
    <section className={styles.section} aria-label="Tentang studio Aldera Tech">
      <div className={cn(shared.container, styles.layout)}>
        <FadeUp className={styles.copy}>
          <p className={styles.eyebrow}>
            <Orbit className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Aldera Tech / Digital Studio
          </p>
          <h2 id="home-summary-heading" className={styles.heading}>
            Dari ide menjadi <span>pengalaman digital</span>
          </h2>
          <p className={styles.description}>
            Kami merancang dan membangun <strong>website</strong>,{" "}
            <strong>aplikasi mobile</strong>, serta{" "}
            <strong>pengalaman digital</strong> yang membantu bisnis bergerak
            lebih jauh.
          </p>
        </FadeUp>
        <StaggerContainer className={styles.strengths}>
          {strengths.map(({ icon: Icon, title, description }, index) => (
            <StaggerItem key={title}>
              <article
                className={cn(styles.card, index === 0 && styles.featured)}
              >
                <span className={styles.icon}>
                  <Icon
                    className="size-5"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </span>
                <div className={styles.cardCopy}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <span className={styles.index} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
