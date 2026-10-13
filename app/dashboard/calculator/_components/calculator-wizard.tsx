"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Plus,
  Send,
  Star,
  Trash2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
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

export type { ProjectType, Feature, AddOn, Config };

export function CalculatorWizard({ data }: { data: CalculatorData }) {
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* Step indicators */}
        <div className="flex gap-1">
          {["Jenis Proyek", "Detail", "Fitur", "Add-On", "Kirim"].map(
            (label, i) => (
              <div
                key={label}
                className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
              />
            )
          )}
        </div>

        {/* Step 0: Select project type */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Pilih Jenis Proyek</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {projectTypes.map((t) => (
                <Card
                  key={t.id}
                  className={`cursor-pointer p-5 transition-all hover:border-primary/50 ${
                    selectedType === t.id
                      ? "border-primary ring-2 ring-primary/20"
                      : ""
                  }`}
                  onClick={() => setSelectedType(t.id)}
                >
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.description}
                  </p>
                  <p className="mt-2 text-sm font-bold">
                    Mulai dari {formatCurrency(Number(t.basePrice))}
                  </p>
                </Card>
              ))}
            </div>
            <Button onClick={() => setStep(1)} disabled={!selectedType}>
              Lanjut <ArrowRight className="size-4" />
            </Button>
          </div>
        )}

        {/* Step 1: Dependent inputs */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Detail {pt?.name}</h2>
            {depFields.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Tidak ada input tambahan untuk jenis proyek ini.
              </p>
            ) : (
              depFields.map((field) => (
                <div key={field.label}>
                  <Label>
                    {field.label}{" "}
                    <span className="text-muted-foreground">
                      ({formatCurrency(field.pricePerUnit)}/{field.unit})
                    </span>
                  </Label>
                  <Input
                    type="number"
                    min={field.min || 1}
                    max={field.max || 99}
                    value={depValues[field.label] || ""}
                    onChange={(e) =>
                      setDepValues({
                        ...depValues,
                        [field.label]: Number(e.target.value),
                      })
                    }
                    placeholder={`Jumlah ${field.unit}`}
                  />
                </div>
              ))
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="size-4" /> Kembali
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={
                  depFields.length > 0 &&
                  depFields.some(
                    (f) =>
                      !depValues[f.label] || depValues[f.label] < (f.min || 1)
                  )
                }
              >
                Lanjut <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Features */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Pilih Fitur</h2>

            {config?.featureDisclaimer && (
              <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <p className="whitespace-pre-line">
                  {config.featureDisclaimer}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {availableFeatures.map((f) => (
                <label
                  key={f.id}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-accent/30"
                >
                  <Checkbox
                    checked={selectedFeatures.includes(f.id)}
                    onCheckedChange={(checked) => {
                      setSelectedFeatures(
                        checked
                          ? [...selectedFeatures, f.id]
                          : selectedFeatures.filter((x) => x !== f.id)
                      );
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{f.name}</span>
                      {f.isMajor && (
                        <Badge className="bg-amber-500 text-[10px] text-white">
                          <Star className="size-2.5" /> Major
                        </Badge>
                      )}
                      <span className="ml-auto text-sm font-semibold">
                        {formatCurrency(Number(f.price))}
                      </span>
                    </div>
                    {f.disclaimer && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {f.disclaimer}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>

            {/* Custom features */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Fitur Custom</h3>
              <p className="text-xs text-muted-foreground">
                Tambahkan fitur yang tidak ada di daftar. Harga standar:{" "}
                {formatCurrency(
                  Number(features.find((f) => !f.isMajor)?.price || 500000)
                )}
                /fitur
              </p>
              {customFeatures.map((cf, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Nama fitur (1 fitur spesifik)"
                    value={cf.name}
                    onChange={(e) => {
                      const arr = [...customFeatures];
                      arr[i].name = e.target.value;
                      setCustomFeatures(arr);
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      setCustomFeatures(
                        customFeatures.filter((_, j) => j !== i)
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setCustomFeatures([
                    ...customFeatures,
                    { name: "", description: "" },
                  ])
                }
                disabled={customFeatures.length >= 10}
              >
                <Plus className="size-4" /> Tambah Fitur
              </Button>
              {customFeatures.length >= 10 && (
                <p className="text-xs text-muted-foreground">
                  Maksimal 10 fitur custom. Untuk proyek lebih besar, hubungi
                  tim kami langsung.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="size-4" /> Kembali
              </Button>
              <Button onClick={() => setStep(3)}>
                Lanjut <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Add-ons & Urgency */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Add-On & Urgency</h2>

            {availableAddOns.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Add-On (opsional)</h3>
                {availableAddOns.map((ao) => (
                  <div key={ao.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{ao.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {formatCurrency(Number(ao.pricePerMonth))}/bulan
                        </span>
                      </div>
                    </div>
                    {ao.description && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ao.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <Label className="text-xs">Durasi (bulan):</Label>
                      <Input
                        type="number"
                        min={0}
                        max={ao.maxMonths}
                        className="h-8 w-20"
                        value={selectedAddOns[ao.id] || ""}
                        onChange={(e) =>
                          setSelectedAddOns({
                            ...selectedAddOns,
                            [ao.id]: Number(e.target.value),
                          })
                        }
                        placeholder="0"
                      />
                      <span className="text-xs text-muted-foreground">
                        (maks {ao.maxMonths} bulan)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Urgency */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Timeline & Urgensi</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                <Card
                  className={`cursor-pointer p-4 transition-all ${
                    urgency === "normal"
                      ? "border-primary ring-2 ring-primary/20"
                      : ""
                  }`}
                  onClick={() => setUrgency("normal")}
                >
                  <p className="font-medium">Normal</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Timeline standar sesuai cakupan fitur
                  </p>
                </Card>
                <Card
                  className={`cursor-pointer p-4 transition-all ${
                    urgency === "urgent"
                      ? "border-amber-500 ring-2 ring-amber-500/20"
                      : ""
                  }`}
                  onClick={() => setUrgency("urgent")}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="size-4 text-amber-500" />
                    <span className="font-medium">Urgent</span>
                    <Badge className="bg-amber-500 text-white">
                      +
                      {Math.round(
                        (Number(config?.urgencyMultiplier || 1.5) - 1) * 100
                      )}
                      %
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Prioritas tinggi, deadline ketat (&lt;
                    {config?.urgencyThresholdDays || 14} hari)
                  </p>
                </Card>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="size-4" /> Kembali
              </Button>
              <Button onClick={() => setStep(4)}>
                Review & Kirim <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Notes & Submit */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Review & Catatan</h2>

            {config?.revisionPolicy && (
              <div className="space-y-2 rounded-lg border bg-muted/40 p-4 text-xs">
                <div>
                  <p className="mb-1 font-semibold">Jatah Revisi Gratis</p>
                  <p>
                    Termasuk {config.freeRevisions}x revisi minor. Revisi
                    berikutnya{" "}
                    {formatCurrency(Number(config.revisionPricePerItem))}/item
                    fitur.
                  </p>
                </div>
                <div>
                  <p className="mb-1 font-semibold">Kebijakan Revisi</p>
                  <p className="whitespace-pre-line">{config.revisionPolicy}</p>
                </div>
              </div>
            )}

            <div>
              <Label>Catatan untuk tim (opsional)</Label>
              <Textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jelaskan singkat tentang proyek Anda..."
              />
            </div>
            <div>
              <Label>Preferred Deadline (opsional)</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="size-4" /> Kembali
              </Button>
              <Button onClick={handleSubmit} disabled={pending}>
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Ajukan Proyek
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Price Sidebar */}
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
