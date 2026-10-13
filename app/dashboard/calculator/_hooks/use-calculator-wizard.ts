"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import { submitOrderRequest } from "@/lib/actions/calculator";
import type { CalculatorData, DependentField } from "../_types/calculator";

export function useCalculatorWizard(data: CalculatorData) {
  const { projectTypes, features, addOns, config } = data;
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string>("");
  const [depValues, setDepValues] = useState<Record<string, number>>({});
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customFeatures, setCustomFeatures] = useState<
    { name: string; description: string }[]
  >([]);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>(
    {}
  );
  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  const pt = projectTypes.find((t) => t.id === selectedType);
  const depFields: DependentField[] = useMemo(
    () =>
      pt && Array.isArray(pt.dependentFields)
        ? (pt.dependentFields as DependentField[])
        : [],
    [pt]
  );
  const availableFeatures = features.filter(
    (f) => !f.projectTypeId || f.projectTypeId === selectedType
  );
  const availableAddOns = addOns.filter(
    (a) => !a.projectTypeId || a.projectTypeId === selectedType
  );

  const total = useMemo(() => {
    if (!pt) return 0;
    let sum = Number(pt.basePrice);
    // Dependent fields
    for (const field of depFields) {
      const val = depValues[field.label] || 0;
      sum += val * field.pricePerUnit;
    }
    // Selected features
    for (const fId of selectedFeatures) {
      const f = features.find((x) => x.id === fId);
      if (f) sum += Number(f.price);
    }
    // Custom features (standard price each)
    const stdPrice = features.find((f) => !f.isMajor)?.price;
    sum += customFeatures.length * Number(stdPrice || 500000);
    // Add-ons
    for (const [addOnId, months] of Object.entries(selectedAddOns)) {
      const ao = addOns.find((a) => a.id === addOnId);
      if (ao && months > 0) sum += Number(ao.pricePerMonth) * months;
    }
    // Urgency
    if (urgency === "urgent")
      sum = Math.round(sum * Number(config?.urgencyMultiplier || 1.5));
    return sum;
  }, [
    pt,
    depValues,
    selectedFeatures,
    customFeatures,
    selectedAddOns,
    urgency,
    depFields,
    features,
    addOns,
    config,
  ]);

  function resetCalculator() {
    setSubmitted(false);
    setStep(0);
    setSelectedType("");
    setSelectedFeatures([]);
    setCustomFeatures([]);
    setSelectedAddOns({});
    setDepValues({});
  }

  function handleSubmit() {
    startTransition(async () => {
      await submitOrderRequest({
        projectTypeId: selectedType,
        features: selectedFeatures,
        customFeatures,
        addOns: Object.entries(selectedAddOns)
          .filter(([, m]) => m > 0)
          .map(([addOnId, months]) => ({ addOnId, months })),
        dependentValues: depValues,
        urgency,
        deadline: deadline || undefined,
        notes: notes || undefined,
        estimatedTotal: total,
      });
      setSubmitted(true);
      toast.success("Order request berhasil dikirim!");
    });
  }

  return {
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
  };
}
