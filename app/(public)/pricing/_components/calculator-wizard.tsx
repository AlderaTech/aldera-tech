"use client";

import type {
  CalculatorData,
  ProjectType,
  Feature,
  AddOn,
  Config,
} from "../_types/calculator";
import { useCalculatorWizard } from "../_hooks/use-calculator-wizard";
import { useCalculatorStepFocus } from "../_hooks/use-calculator-step-focus";
import { CalculatorSuccessScreen } from "./calculator-success-screen";
import { CalculatorSummarySidebar } from "./calculator-summary-sidebar";
import { StepProjectType } from "./calculator-steps/step-project-type";
import { StepDetails } from "./calculator-steps/step-details";
import { StepFeatures } from "./calculator-steps/step-features";
import { StepAddOns } from "./calculator-steps/step-addons";
import { StepReview } from "./calculator-steps/step-review";
import { cn } from "@/lib/utils";
import styles from "./pricing-calculator.module.css";
import dashboardStyles from "./calculator-dashboard.module.css";
import { CalculatorStepper, CALCULATOR_STEPS } from "./calculator-stepper";

export type { ProjectType, Feature, AddOn, Config };

type CalculatorWizardProps = {
  data: CalculatorData;
  isAuthenticated?: boolean;
  whatsappNumber?: string;
  appearance?: "default" | "studio" | "dashboard";
};

export function CalculatorWizard({
  data,
  isAuthenticated = false,
  whatsappNumber,
  appearance = "default",
}: CalculatorWizardProps) {
  const studio = appearance === "studio";
  const dashboard = appearance === "dashboard";
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
  const stageRef = useCalculatorStepFocus(step, dashboard);

  if (submitted) {
    const success = (
      <CalculatorSuccessScreen total={total} onReset={resetCalculator} />
    );
    return studio || dashboard ? (
      <div
        className={cn(
          studio && styles.studio,
          dashboard && dashboardStyles.dashboard,
          dashboard && dashboardStyles.success
        )}
        role={dashboard ? "status" : undefined}
      >
        {success}
      </div>
    ) : (
      success
    );
  }

  return (
    <div
      className={cn(
        "grid gap-8 lg:grid-cols-[1fr_320px]",
        studio && styles.studio,
        studio && styles.wizard,
        dashboard && dashboardStyles.dashboard,
        dashboard && dashboardStyles.wizard
      )}
    >
      <div
        className={cn(
          "space-y-6",
          studio && styles.stepContent,
          dashboard && dashboardStyles.configuration
        )}
      >
        {/* Step indicators */}
        <CalculatorStepper step={step} studio={studio} dashboard={dashboard} />

        {/* Steps */}
        <section
          ref={stageRef}
          tabIndex={dashboard ? -1 : undefined}
          aria-label={
            dashboard ? `Konfigurasi ${CALCULATOR_STEPS[step]}` : undefined
          }
          className={dashboard ? dashboardStyles.stage : undefined}
        >
          {step === 0 && (
            <StepProjectType
              projectTypes={projectTypes}
              selectedType={selectedType}
              onSelectType={(id) => setSelectedType(id)}
              onNext={() => setStep(1)}
              studio={studio}
              dashboard={dashboard}
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
              dashboard={dashboard}
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
              dashboard={dashboard}
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
              dashboard={dashboard}
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
              dashboard={dashboard}
            />
          )}
        </section>
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
        dashboard={dashboard}
      />
    </div>
  );
}
