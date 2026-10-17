import { Compass, Route } from "lucide-react";
import { FadeUp } from "@/components/shared/motion";
import { cn } from "@/lib/utils";
import { aboutMissions, aboutVision } from "../_constants/about-direction";
import { PurposeMascot } from "./purpose-mascot";
import shared from "../../_components/studio.module.css";
import styles from "./about-purpose.module.css";

export function AboutPurpose() {
  return (
    <section
      className={cn(shared.section, styles.section)}
      aria-labelledby="about-purpose-heading"
    >
      <div className={shared.container}>
        <FadeUp className={styles.header}>
          <p className={cn(shared.eyebrow, styles.eyebrow)}>
            Arah yang menyatukan langkah kami
          </p>
          <h2 id="about-purpose-heading" className={styles.heading}>
            Visi besar. <span>Langkah yang terarah.</span>
          </h2>
        </FadeUp>
        <FadeUp className={styles.vision}>
          <div className={styles.visionCopy}>
            <div className={styles.visionTop}>
              <span className={styles.visionIcon}>
                <Compass
                  className="size-6"
                  strokeWidth={1.4}
                  aria-hidden="true"
                />
              </span>
              <h3>Visi Kami</h3>
            </div>
            <p className={styles.visionText}>{aboutVision}</p>
            <div
              className={styles.principles}
              aria-label="Fokus visi Aldera Tech"
            >
              <span>Strategis</span>
              <span>Berkualitas</span>
              <span>Berkelanjutan</span>
            </div>
          </div>
          <PurposeMascot />
        </FadeUp>
        <div
          className={styles.missions}
          aria-labelledby="about-missions-heading"
        >
          <FadeUp className={styles.missionsHeading}>
            <div>
              <Route className="size-5" strokeWidth={1.5} aria-hidden="true" />
              <h3 id="about-missions-heading">Misi Kami</h3>
            </div>
            <span className={styles.headingRule} aria-hidden="true" />
            <span className={styles.missionCount}>
              {aboutMissions.length} langkah nyata
            </span>
          </FadeUp>
          <ol className={styles.missionsGrid}>
            {aboutMissions.map(({ icon: Icon, title, description }, index) => (
              <li key={title}>
                <FadeUp
                  delay={index * 0.08}
                  className={cn(
                    styles.missionCard,
                    index === 1 && styles.highlight
                  )}
                >
                  <div className={styles.cardMeta}>
                    <span className={styles.icon}>
                      <Icon
                        className="size-5"
                        strokeWidth={1.6}
                        aria-hidden="true"
                      />
                    </span>
                    <span className={styles.step} aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h4>{title}</h4>
                  <p>{description}</p>
                </FadeUp>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
