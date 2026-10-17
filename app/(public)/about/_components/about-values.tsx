import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import { cn } from "@/lib/utils";
import { aboutValues } from "../_constants/about-content";
import { AboutValueCard } from "./about-value-card";
import { AboutValuesVisual } from "./about-values-visual";
import shared from "../../_components/studio.module.css";
import styles from "./about-values.module.css";

export function AboutValues() {
  return (
    <section
      className={cn(shared.section, styles.section)}
      aria-labelledby="about-values-heading"
    >
      <div className={cn(shared.container, styles.layout)}>
        <FadeUp className={styles.intro}>
          <div>
            <p className={cn(shared.eyebrow, styles.eyebrow)}>
              Prinsip dalam setiap keputusan
            </p>
            <h2 id="about-values-heading" className={styles.heading}>
              Nilai yang <span>kami pegang</span>
            </h2>
            <p className={cn(shared.description, styles.description)}>
              Empat prinsip yang memandu cara kami bekerja.
            </p>
          </div>
          <AboutValuesVisual count={aboutValues.length} />
        </FadeUp>
        <StaggerContainer className={styles.valuesList}>
          {aboutValues.map((value, index) => (
            <StaggerItem key={value.title}>
              <AboutValueCard
                value={value}
                position={index + 1}
                featured={index === 1}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
