"use client";

import type {
  CalculatorData,
  ProjectType,
  Feature,
  AddOn,
  Config,
} from "../_types/calculator";
import { useCalculatorWizard } from "../_hooks/use-calculator-wizard";
import { CalculatorSuccessScreen } from "./calculator-success-screen";
import { CalculatorSummarySidebar } from "./calculator-summary-sidebar";
import { StepProjectType } from "./calculator-steps/step-project-type";
import { StepDetails } from "./calculator-steps/step-details";
import { StepFeatures } from "./calculator-steps/step-features";
import { StepAddOns } from "./calculator-steps/step-addons";
import { StepReview } from "./calculator-steps/step-review";
import { cn } from "@/lib/utils";
import styles from "./pricing-calculator.module.css";

export type { ProjectType, Feature, AddOn, Config };

type CalculatorWizardProps = {
  data: CalculatorData;
  isAuthenticated?: boolean;
  whatsappNumber?: string;
  appearance?: "default" | "studio";
};

export function CalculatorWizard({
  data,
  isAuthenticated = false,
  whatsappNumber,
  appearance = "default",
}: CalculatorWizardProps) {
  const studio = appearance === "studio";
  const { projectTypes, features, config } = data;
  const {
    step,
    setStep,
    selectedType,
    setSelectedType,
    depValues,
    setDepValues,
    selectedFeatures,
    setSelectedFeatures,
    customFeatures,
    setCustomFeatures,
    selectedAddOns,
    setSelectedAddOns,
    urgency,
    setUrgency,
    deadline,
    setDeadline,
    notes,
    setNotes,
    submitted,
    pending,
    pt,
    depFields,
    availableFeatures,
    availableAddOns,
    total,
    handleSubmit,
    resetCalculator,
  } = useCalculatorWizard(data);

  if (submitted) {
    const success = (
      <CalculatorSuccessScreen total={total} onReset={resetCalculator} />
    );
    return studio ? <div className={styles.studio}>{success}</div> : success;
  }

  const stepLabels = ["Jenis", "Skala", "Fitur", "Add-On", "Review"];

  return (
    <div
      className={cn(
        "grid gap-8 lg:grid-cols-[1fr_320px]",
        studio && styles.studio,
        studio && styles.wizard
      )}
    >
      <div className={cn("space-y-6", studio && styles.stepContent)}>
        {/* Step indicators */}
        <div className={cn("space-y-2", studio && styles.progress)}>
          {studio && (
            <div className={styles.progressMeta}>
              <span>
                Langkah {step + 1} dari {stepLabels.length}
              </span>
              <strong>{stepLabels[step]}</strong>
            </div>
          )}
          <div className={cn("flex gap-1.5", studio && styles.progressTrack)}>
            {stepLabels.map((_, i) => (
              <div
                key={i}
                data-complete={studio ? i <= step : undefined}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i <= step ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
          <div className="flex justify-between text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            {stepLabels.map((label, i) => (
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

        {/* Steps */}
        {step === 0 && (
          <StepProjectType
            projectTypes={projectTypes}
            selectedType={selectedType}
            onSelectType={(id) => setSelectedType(id)}
            onNext={() => setStep(1)}
            studio={studio}
          />
        )}

        {step === 1 && (
          <StepDetails
            pt={pt}
            depFields={depFields}
            depValues={depValues}
            onDepValueChange={(label, val) =>
              setDepValues({ ...depValues, [label]: val })
            }
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepFeatures
            availableFeatures={availableFeatures}
            selectedFeatures={selectedFeatures}
            onToggleFeature={(id, checked) =>
              setSelectedFeatures(
                checked
                  ? [...selectedFeatures, id]
                  : selectedFeatures.filter((x) => x !== id)
              )
            }
            customFeatures={customFeatures}
            onCustomFeaturesChange={setCustomFeatures}
            config={config}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <StepAddOns
            availableAddOns={availableAddOns}
            selectedAddOns={selectedAddOns}
            onAddOnChange={(id, months) =>
              setSelectedAddOns({ ...selectedAddOns, [id]: months })
            }
            urgency={urgency}
            onUrgencyChange={setUrgency}
            config={config}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
            studio={studio}
          />
        )}

        {step === 4 && (
          <StepReview
            config={config}
            notes={notes}
            onNotesChange={setNotes}
            deadline={deadline}
            onDeadlineChange={setDeadline}
            isAuthenticated={isAuthenticated}
            pending={pending}
            total={total}
            ptName={pt?.name}
            whatsappNumber={whatsappNumber}
            onBack={() => setStep(3)}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {/* Price Summary Sidebar */}
      <CalculatorSummarySidebar
        pt={pt}
        depFields={depFields}
        depValues={depValues}
        selectedFeatures={selectedFeatures}
        features={features}
        customFeatures={customFeatures}
        selectedAddOns={selectedAddOns}
        addOns={availableAddOns}
        urgency={urgency}
        config={config}
        total={total}
        studio={studio}
      />
    </div>
  );
}
