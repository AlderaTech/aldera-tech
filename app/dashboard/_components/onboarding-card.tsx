import Link from "next/link";
import { Check, ArrowRight, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./overview.module.css";
import onboardingStyles from "./onboarding-card.module.css";
import { OnboardingPieChart } from "./onboarding-pie-chart";

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  done: boolean;
  cta: { label: string; href: string };
};

export function OnboardingCard({
  steps,
  completed,
  total,
  percent,
}: {
  steps: OnboardingStep[];
  completed: number;
  total: number;
  percent: number;
}) {
  const nextStepIndex = steps.findIndex((step) => !step.done);

  return (
    <section
      className={cn(styles.panel, onboardingStyles.card)}
      aria-labelledby="onboarding-heading"
    >
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>
            <Layers aria-hidden="true" /> Mulai di sini
          </p>
          <h2 id="onboarding-heading" className={styles.sectionTitle}>
            Checklist Onboarding
          </h2>
        </div>
      </div>
      <div className={onboardingStyles.body}>
        <OnboardingPieChart
          completed={completed}
          total={total}
          percent={percent}
        />
        <div className={onboardingStyles.details}>
          <p className={onboardingStyles.summary}>
            Selesaikan{" "}
            <strong>
              {completed} dari {total} langkah
            </strong>{" "}
            untuk memaksimalkan pengalaman Anda.
          </p>
          <ul className={onboardingStyles.steps}>
            {steps.map((step, index) => (
              <li
                key={step.id}
                aria-label={`${step.title}: ${step.done ? "selesai" : "belum selesai"}`}
                data-next={index === nextStepIndex || undefined}
                className={cn(
                  onboardingStyles.step,
                  step.done && onboardingStyles.done
                )}
              >
                <span className={onboardingStyles.stepIcon} aria-hidden="true">
                  {step.done ? <Check /> : String(index + 1).padStart(2, "0")}
                </span>
                <div className={onboardingStyles.stepCopy}>
                  <div className={onboardingStyles.stepHeading}>
                    <h3>{step.title}</h3>
                    {step.done ? (
                      <span className={onboardingStyles.stepStatus}>
                        Selesai
                      </span>
                    ) : index === nextStepIndex ? (
                      <span className={onboardingStyles.stepStatus}>
                        Berikutnya
                      </span>
                    ) : null}
                  </div>
                  <p>{step.description}</p>
                </div>
                {!step.done && (
                  <Link
                    href={step.cta.href}
                    className={cn(styles.textLink, onboardingStyles.stepAction)}
                  >
                    {step.cta.label}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
