"use client";

import { useState, useTransition, useMemo } from "react";
import { toast } from "sonner";
import {
  AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Clock, Info,
  Loader2, Plus, Send, Star, Trash2, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { submitOrderRequest } from "@/lib/actions/calculator";
import Link from "next/link";

type DependentField = { label: string; type: string; pricePerUnit: number; unit: string; min?: number; max?: number };
type ProjectType = { id: string; name: string; slug: string; description: string | null; basePrice: any; icon: string; dependentFields: any; order: number };
type Feature = { id: string; name: string; description: string | null; price: any; isMajor: boolean; disclaimer: string | null; projectTypeId: string | null };
type AddOn = { id: string; name: string; description: string | null; pricePerMonth: any; minMonths: number; maxMonths: number; projectTypeId: string | null };
type Config = { featureDisclaimer: string; revisionPolicy: string; freeRevisions: number; revisionPricePerItem: any; urgencyMultiplier: any; urgencyThresholdDays: number } | null;

type Props = { data: { projectTypes: ProjectType[]; features: Feature[]; addOns: AddOn[]; config: Config } };

export function CalculatorWizard({ data }: Props) {
  const { projectTypes, features, addOns, config } = data;
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<string>("");
  const [depValues, setDepValues] = useState<Record<string, number>>({});
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customFeatures, setCustomFeatures] = useState<{ name: string; description: string }[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});
  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  const pt = projectTypes.find((t) => t.id === selectedType);
  const depFields: DependentField[] = pt ? (pt.dependentFields as DependentField[]) : [];
  const availableFeatures = features.filter((f) => !f.projectTypeId || f.projectTypeId === selectedType);
  const availableAddOns = addOns.filter((a) => !a.projectTypeId || a.projectTypeId === selectedType);

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
    if (urgency === "urgent") sum = Math.round(sum * Number(config?.urgencyMultiplier || 1.5));
    return sum;
  }, [pt, depValues, selectedFeatures, customFeatures, selectedAddOns, urgency, depFields, features, addOns, config]);

  function handleSubmit() {
    startTransition(async () => {
      await submitOrderRequest({
        projectTypeId: selectedType,
        features: selectedFeatures,
        customFeatures,
        addOns: Object.entries(selectedAddOns).filter(([, m]) => m > 0).map(([addOnId, months]) => ({ addOnId, months })),
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

  if (submitted) {
    return (
      <Card className="flex flex-col items-center p-10 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#0b6bff]/10">
          <CheckCircle2 className="size-8 text-[#0b6bff]" />
        </div>
        <h2 className="text-2xl font-black">Estimasi Anda sudah dikirim!</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Tim kami akan menghubungi Anda dalam 1x24 jam untuk mendiskusikan detail proyek dan membuat proposal resmi.
        </p>
        <p className="mt-4 text-lg font-bold">Total estimasi: {formatCurrency(total)}</p>
        <Button className="mt-6" onClick={() => { setSubmitted(false); setStep(0); setSelectedType(""); setSelectedFeatures([]); setCustomFeatures([]); setSelectedAddOns({}); setDepValues({}); }}>
          Hitung Estimasi Baru
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* Step indicators */}
        <div className="flex gap-1">
          {["Jenis Proyek", "Detail", "Fitur", "Add-On", "Kirim"].map((label, i) => (
            <div key={label} className={`flex-1 rounded-full h-1.5 ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        {/* Step 0: Select project type */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Pilih Jenis Proyek</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {projectTypes.map((t) => (
                <Card
                  key={t.id}
                  className={`cursor-pointer p-5 transition-all hover:border-primary/50 ${selectedType === t.id ? "border-primary ring-2 ring-primary/20" : ""}`}
                  onClick={() => setSelectedType(t.id)}
                >
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
                  <p className="mt-2 text-sm font-bold">Mulai dari {formatCurrency(Number(t.basePrice))}</p>
                </Card>
              ))}
            </div>
            <Button onClick={() => setStep(1)} disabled={!selectedType}>Lanjut <ArrowRight className="size-4" /></Button>
          </div>
        )}

        {/* Step 1: Dependent inputs */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Detail {pt?.name}</h2>
            {depFields.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada input tambahan untuk jenis proyek ini.</p>
            ) : (
              depFields.map((field) => (
                <div key={field.label}>
                  <Label>{field.label} <span className="text-muted-foreground">({formatCurrency(field.pricePerUnit)}/{field.unit})</span></Label>
                  <Input
                    type="number"
                    min={field.min || 1}
                    max={field.max || 99}
                    value={depValues[field.label] || ""}
                    onChange={(e) => setDepValues({ ...depValues, [field.label]: Number(e.target.value) })}
                    placeholder={`Jumlah ${field.unit}`}
                  />
                </div>
              ))
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft className="size-4" /> Kembali</Button>
              <Button onClick={() => setStep(2)} disabled={depFields.length > 0 && depFields.some((f) => !depValues[f.label] || depValues[f.label] < (f.min || 1))}>Lanjut <ArrowRight className="size-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 2: Features */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Pilih Fitur</h2>

            {config?.featureDisclaimer && (
              <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <p className="whitespace-pre-line">{config.featureDisclaimer}</p>
              </div>
            )}

            <div className="space-y-2">
              {availableFeatures.map((f) => (
                <label key={f.id} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/30">
                  <Checkbox
                    checked={selectedFeatures.includes(f.id)}
                    onCheckedChange={(checked) => {
                      setSelectedFeatures(checked ? [...selectedFeatures, f.id] : selectedFeatures.filter((x) => x !== f.id));
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{f.name}</span>
                      {f.isMajor && <Badge className="bg-amber-500 text-white text-[10px]"><Star className="size-2.5" /> Major</Badge>}
                      <span className="ml-auto text-sm font-semibold">{formatCurrency(Number(f.price))}</span>
                    </div>
                    {f.disclaimer && <p className="mt-1 text-xs text-muted-foreground">{f.disclaimer}</p>}
                  </div>
                </label>
              ))}
            </div>

            {/* Custom features */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Fitur Custom</h3>
              <p className="text-xs text-muted-foreground">Tambahkan fitur yang tidak ada di daftar. Harga standar: {formatCurrency(Number(features.find((f) => !f.isMajor)?.price || 500000))}/fitur</p>
              {customFeatures.map((cf, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Nama fitur (1 fitur spesifik)" value={cf.name} onChange={(e) => { const arr = [...customFeatures]; arr[i].name = e.target.value; setCustomFeatures(arr); }} />
                  <Button size="icon" variant="ghost" onClick={() => setCustomFeatures(customFeatures.filter((_, j) => j !== i))}><Trash2 className="size-4" /></Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={() => setCustomFeatures([...customFeatures, { name: "", description: "" }])} disabled={customFeatures.length >= 10}><Plus className="size-4" /> Tambah Fitur</Button>
              {customFeatures.length >= 10 && <p className="text-xs text-muted-foreground">Maksimal 10 fitur custom. Untuk proyek lebih besar, hubungi tim kami langsung.</p>}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="size-4" /> Kembali</Button>
              <Button onClick={() => setStep(3)}>Lanjut <ArrowRight className="size-4" /></Button>
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
                        <span className="ml-2 text-xs text-muted-foreground">{formatCurrency(Number(ao.pricePerMonth))}/bulan</span>
                      </div>
                    </div>
                    {ao.description && <p className="mt-1 text-xs text-muted-foreground">{ao.description}</p>}
                    <div className="mt-2 flex items-center gap-2">
                      <Label className="text-xs">Durasi (bulan):</Label>
                      <Input
                        type="number"
                        min={0}
                        max={ao.maxMonths}
                        className="w-20 h-8"
                        value={selectedAddOns[ao.id] || ""}
                        onChange={(e) => setSelectedAddOns({ ...selectedAddOns, [ao.id]: Number(e.target.value) })}
                        placeholder="0"
                      />
                      <span className="text-xs text-muted-foreground">({ao.minMonths}-{ao.maxMonths} bulan)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Urgency</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className={`cursor-pointer p-4 ${urgency === "normal" ? "border-primary ring-2 ring-primary/20" : ""}`} onClick={() => setUrgency("normal")}>
                  <div className="flex items-center gap-2"><Clock className="size-4" /><span className="font-medium">Normal</span></div>
                  <p className="mt-1 text-xs text-muted-foreground">Deadline &gt; {config?.urgencyThresholdDays || 14} hari</p>
                </Card>
                <Card className={`cursor-pointer p-4 ${urgency === "urgent" ? "border-amber-500 ring-2 ring-amber-500/20" : ""}`} onClick={() => setUrgency("urgent")}>
                  <div className="flex items-center gap-2"><Zap className="size-4 text-amber-500" /><span className="font-medium">Urgent</span><Badge className="bg-amber-500 text-white">+{Math.round((Number(config?.urgencyMultiplier || 1.5) - 1) * 100)}%</Badge></div>
                  <p className="mt-1 text-xs text-muted-foreground">Deadline ≤ {config?.urgencyThresholdDays || 14} hari</p>
                </Card>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="size-4" /> Kembali</Button>
              <Button onClick={() => setStep(4)}>Lanjut <ArrowRight className="size-4" /></Button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Review & Kirim</h2>

            {/* Summary */}
            <Card className="p-4 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Jenis Proyek</span><span className="font-medium">{pt?.name}</span></div>
              {depFields.map((f) => depValues[f.label] ? (
                <div key={f.label} className="flex justify-between"><span className="text-muted-foreground">{f.label}</span><span>{depValues[f.label]} {f.unit}</span></div>
              ) : null)}
              {selectedFeatures.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Fitur ({selectedFeatures.length}):</span>
                  <ul className="mt-1 ml-4 list-disc text-xs">
                    {selectedFeatures.map((fId) => { const f = features.find((x) => x.id === fId); return f ? <li key={fId}>{f.name} — {formatCurrency(Number(f.price))}</li> : null; })}
                  </ul>
                </div>
              )}
              {customFeatures.filter((c) => c.name).length > 0 && (
                <div>
                  <span className="text-muted-foreground">Fitur Custom ({customFeatures.filter((c) => c.name).length}):</span>
                  <ul className="mt-1 ml-4 list-disc text-xs">
                    {customFeatures.filter((c) => c.name).map((c, i) => <li key={i}>{c.name}</li>)}
                  </ul>
                </div>
              )}
              {Object.entries(selectedAddOns).filter(([, m]) => m > 0).map(([id, months]) => { const ao = addOns.find((a) => a.id === id); return ao ? (
                <div key={id} className="flex justify-between"><span className="text-muted-foreground">{ao.name}</span><span>{months} bulan</span></div>
              ) : null; })}
              <div className="flex justify-between"><span className="text-muted-foreground">Urgency</span><span>{urgency === "urgent" ? "Urgent" : "Normal"}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total Estimasi</span><span>{formatCurrency(total)}</span></div>
            </Card>

            {config?.revisionPolicy && (
              <div className="flex gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                <Info className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-1">Kebijakan Revisi</p>
                  <p className="whitespace-pre-line">{config.revisionPolicy}</p>
                </div>
              </div>
            )}

            <div>
              <Label>Catatan untuk tim (opsional)</Label>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Jelaskan singkat tentang proyek Anda..." />
            </div>
            <div>
              <Label>Preferred Deadline (opsional)</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="size-4" /> Kembali</Button>
              <Button onClick={handleSubmit} disabled={pending}>
                {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Ajukan Proyek
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Price Sidebar */}
      <div className="lg:sticky lg:top-24 h-fit">
        <Card className="p-5 space-y-3">
          <h3 className="font-semibold">Estimasi Harga</h3>
          {pt && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Base ({pt.name})</span><span>{formatCurrency(Number(pt.basePrice))}</span></div>
              {depFields.map((f) => depValues[f.label] ? (
                <div key={f.label} className="flex justify-between"><span>{f.label} ({depValues[f.label]} {f.unit})</span><span>{formatCurrency(depValues[f.label] * f.pricePerUnit)}</span></div>
              ) : null)}
              {selectedFeatures.map((fId) => { const f = features.find((x) => x.id === fId); return f ? (
                <div key={fId} className="flex justify-between"><span className="truncate mr-2">{f.name}</span><span className="shrink-0">{formatCurrency(Number(f.price))}</span></div>
              ) : null; })}
              {customFeatures.filter((c) => c.name).map((c, i) => (
                <div key={i} className="flex justify-between"><span className="truncate mr-2">{c.name}</span><span className="shrink-0">{formatCurrency(Number(features.find((f) => !f.isMajor)?.price || 500000))}</span></div>
              ))}
              {Object.entries(selectedAddOns).filter(([, m]) => m > 0).map(([id, months]) => { const ao = addOns.find((a) => a.id === id); return ao ? (
                <div key={id} className="flex justify-between"><span>{ao.name} ({months} bln)</span><span>{formatCurrency(Number(ao.pricePerMonth) * months)}</span></div>
              ) : null; })}
              {urgency === "urgent" && <div className="flex justify-between text-amber-600"><span>Urgent (+{Math.round((Number(config?.urgencyMultiplier || 1.5) - 1) * 100)}%)</span><span>×{config?.urgencyMultiplier || 1.5}</span></div>}
            </div>
          )}
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">*Harga estimasi, final setelah review tim</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
