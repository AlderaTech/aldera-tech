import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./pricing-calculator.module.css";
import dashboardStyles from "./calculator-dashboard.module.css";

export const CALCULATOR_STEPS = ["Jenis", "Skala", "Fitur", "Add-on", "Review"];

export function CalculatorStepper({
  step,
  studio,
  dashboard,
}: {
  step: number;
  studio: boolean;
  dashboard: boolean;
}) {
  if (dashboard)
    return (
      <div className={dashboardStyles.stepper}>
        <div className={dashboardStyles.stepMeta}>
          <h2>Konfigurasi proyek</h2>
          <p role="status">
            Langkah {step + 1} dari {CALCULATOR_STEPS.length}{" "}
            <span className="sr-only">: {CALCULATOR_STEPS[step]}</span>
          </p>
        </div>
        <ol aria-label="Tahapan kalkulator">
          {CALCULATOR_STEPS.map((label, index) => (
            <li
              key={label}
              aria-current={index === step ? "step" : undefined}
              data-complete={index < step}
            >
              <span className={dashboardStyles.stepNumber} aria-hidden="true">
                {index < step ? <Check /> : index + 1}
              </span>
              <span>{label}</span>
              <span className="sr-only">
                {index < step
                  ? ": selesai"
                  : index > step
                    ? ": tahap berikutnya"
                    : ": aktif"}
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  return (
    <div className={cn("space-y-2", studio && styles.progress)}>
      {studio && (
        <div className={styles.progressMeta}>
          <span>
            Langkah {step + 1} dari {CALCULATOR_STEPS.length}
          </span>
          <strong>{CALCULATOR_STEPS[step]}</strong>
        </div>
      )}
      <div className={cn("flex gap-1.5", studio && styles.progressTrack)}>
        {CALCULATOR_STEPS.map((label, i) => (
          <div
            key={label}
            data-complete={studio ? i <= step : undefined}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= step ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>
      <div className="flex justify-between text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
        {CALCULATOR_STEPS.map((label, i) => (
          <span
            key={label}
            className={i === step ? "font-bold text-primary" : undefined}
            aria-current={i === step ? "step" : undefined}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
