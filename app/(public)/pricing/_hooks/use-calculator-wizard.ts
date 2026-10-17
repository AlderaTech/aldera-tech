"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import { submitOrderRequest } from "@/lib/actions/calculator";
import { calculateOrderTotal } from "@/lib/calculator-utils";
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

  function handleSelectType(typeId: string) {
    if (typeId !== selectedType) {
      setSelectedType(typeId);
      setDepValues({});
      setSelectedFeatures([]);
      setSelectedAddOns({});
    }
  }

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
    const stdPrice = features.find((f) => !f.isMajor)?.price;
    const validCustomFeatures = customFeatures.filter(
      (f) => f.name && f.name.trim().length > 0
    );
    return calculateOrderTotal({
      basePrice: Number(pt.basePrice),
      dependentFields: depFields.map((field) => ({
        value: depValues[field.label] || 0,
        pricePerUnit: field.pricePerUnit,
      })),
      featurePrices: selectedFeatures
        .map((fId) => features.find((x) => x.id === fId)?.price)
        .filter((p): p is number => p !== undefined)
        .map(Number),
      customFeatureCount: validCustomFeatures.length,
      customFeaturePrice: stdPrice ? Number(stdPrice) : 500000,
      addOns: Object.entries(selectedAddOns).map(([addOnId, months]) => {
        const ao = addOns.find((a) => a.id === addOnId);
        return {
          pricePerMonth: ao ? Number(ao.pricePerMonth) : 0,
          months,
        };
      }),
      urgency,
      urgencyMultiplier: config?.urgencyMultiplier
        ? Number(config.urgencyMultiplier)
        : 1.5,
    });
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
      try {
        const validCustomFeatures = customFeatures.filter(
          (f) => f.name && f.name.trim().length > 0
        );
        await submitOrderRequest({
          projectTypeId: selectedType,
          features: selectedFeatures,
          customFeatures: validCustomFeatures,
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
        toast.success("Order request berhasil diajukan!");
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Gagal mengajukan estimasi proyek. Silakan coba lagi."
        );
      }
    });
  }

  return {
    step,
    setStep,
    selectedType,
    setSelectedType: handleSelectType,
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
