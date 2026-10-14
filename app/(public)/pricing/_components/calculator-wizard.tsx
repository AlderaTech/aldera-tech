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

export type { ProjectType, Feature, AddOn, Config };

type CalculatorWizardProps = {
  data: CalculatorData;
  isAuthenticated?: boolean;
  whatsappNumber?: string;
};

export function CalculatorWizard({
  data,
  isAuthenticated = false,
  whatsappNumber,
}: CalculatorWizardProps) {
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
    return <CalculatorSuccessScreen total={total} onReset={resetCalculator} />;
  }

  const stepLabels = ["Jenis", "Skala", "Fitur", "Add-On", "Review"];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* Step indicators */}
        <div className="space-y-2">
          <div className="flex gap-1.5">
            {stepLabels.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            {stepLabels.map((label, i) => (
              <span
                key={label}
                className={i === step ? "font-bold text-primary" : undefined}
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
      />
    </div>
  );
}
