"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCalculatorConfig } from "@/lib/actions/calculator";
import type { AdminConfig } from "../_types/calculator-admin";

export function ConfigTab({ config }: { config: AdminConfig }) {
  const [pending, start] = useTransition();

  function handleSubmit(fd: FormData) {
    start(async () => {
      await updateCalculatorConfig({
        featureDisclaimer: fd.get("featureDisclaimer") as string,
        revisionPolicy: fd.get("revisionPolicy") as string,
        freeRevisions: Number(fd.get("freeRevisions")),
        revisionPricePerItem: Number(fd.get("revisionPricePerItem")),
        urgencyMultiplier: Number(fd.get("urgencyMultiplier")),
        urgencyThresholdDays: Number(fd.get("urgencyThresholdDays")),
        dpPercentage: Number(fd.get("dpPercentage")),
      });
      toast.success("Pengaturan kalkulator berhasil disimpan");
    });
  }

  return (
    <Card className="border-slate-200/80 shadow-xs">
      <form action={handleSubmit}>
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <SlidersHorizontal className="size-4 text-primary" />
            <span>Pengaturan Formula & Kebijakan Kalkulator</span>
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs text-muted-foreground">
            Konfigurasikan kebijakan kuota revisi, multiplier timeline ekspres,
            persentase uang muka (DP), dan teks klausul estimasi.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Section 1: Financial & Urgency Parameters */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Parameter Finansial & Deadline
              </h3>
              <p className="text-xs text-muted-foreground">
                Formula penentuan biaya revisi tambahan, uang muka, dan biaya
                ekspres.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="cfg-free-rev" className="text-xs font-medium">
                  Jatah Revisi Gratis (kali){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cfg-free-rev"
                  name="freeRevisions"
                  type="number"
                  min={0}
                  required
                  placeholder="Contoh: 2"
                  defaultValue={config?.freeRevisions ?? 2}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cfg-rev-price" className="text-xs font-medium">
                  Biaya per Revisi Tambahan (IDR){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cfg-rev-price"
                  name="revisionPricePerItem"
                  type="number"
                  min={0}
                  step={50000}
                  required
                  placeholder="Contoh: 300000"
                  defaultValue={config?.revisionPricePerItem ?? 300000}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cfg-dp" className="text-xs font-medium">
                  Uang Muka / Down Payment (%){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cfg-dp"
                  name="dpPercentage"
                  type="number"
                  min={0}
                  max={100}
                  required
                  placeholder="Contoh: 25"
                  defaultValue={config?.dpPercentage ?? 25}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cfg-urg-mult" className="text-xs font-medium">
                  Multiplier Proyek Mendesak (x){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cfg-urg-mult"
                  name="urgencyMultiplier"
                  type="number"
                  step="0.05"
                  min={1}
                  required
                  placeholder="Contoh: 1.5"
                  defaultValue={config?.urgencyMultiplier ?? 1.5}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cfg-urg-days" className="text-xs font-medium">
                  Batas Hari Kategori Mendesak (Hari){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cfg-urg-days"
                  name="urgencyThresholdDays"
                  type="number"
                  min={1}
                  required
                  placeholder="Contoh: 14"
                  defaultValue={config?.urgencyThresholdDays ?? 14}
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Public Policies & Disclaimers */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Kebijakan & Teks Informasi Publik
              </h3>
              <p className="text-xs text-muted-foreground">
                Teks klausul yang ditampilkan kepada klien pada formulir
                kalkulator dan ringkasan estimasi.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="cfg-feat-disclaimer"
                  className="text-xs font-medium"
                >
                  Disclaimer Fitur & Ketentuan Umum{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="cfg-feat-disclaimer"
                  name="featureDisclaimer"
                  rows={3}
                  required
                  placeholder="Estimasi biaya merupakan perkiraan awal dan dapat disesuaikan setelah diskusi scope kerja final..."
                  defaultValue={config?.featureDisclaimer || ""}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cfg-rev-policy" className="text-xs font-medium">
                  Kebijakan Revisi & SLA Desain/Development{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="cfg-rev-policy"
                  name="revisionPolicy"
                  rows={4}
                  required
                  placeholder="Ketentuan mengenai siklus revisi minor, batas waktu umpan balik klien, dan penagihan revisi tambahan..."
                  defaultValue={config?.revisionPolicy || ""}
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-3.5">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 size-4" />
            )}
            Simpan Pengaturan
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
