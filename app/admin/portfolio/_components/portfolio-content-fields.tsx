"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PortfolioFormReturn } from "../_hooks/use-portfolio-form";

export function PortfolioContentFields({
  form,
}: {
  form: PortfolioFormReturn;
}) {
  return (
    <Card className="space-y-4 border p-5 shadow-sm">
      <h3 className="text-base font-semibold text-foreground">
        Narasi Studi Kasus
      </h3>

      <div className="space-y-2">
        <Label htmlFor="summary">Ringkasan Eksekutif (Summary) *</Label>
        <Textarea
          id="summary"
          placeholder="Jelaskan gambaran umum proyek dan tujuan bisnis yang ingin dicapai..."
          rows={3}
          value={form.summary}
          onChange={(e) => form.setSummary(e.target.value)}
        />
        {form.errors.summary && (
          <p className="text-xs text-destructive">{form.errors.summary}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="challenge">Tantangan & Kendala (Challenge) *</Label>
        <Textarea
          id="challenge"
          placeholder="Deskripsikan masalah teknis, skalabilitas, arsitektur lama, atau bottleneck UX..."
          rows={3}
          value={form.challenge}
          onChange={(e) => form.setChallenge(e.target.value)}
        />
        {form.errors.challenge && (
          <p className="text-xs text-destructive">{form.errors.challenge}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="solution">
          Solusi Teknis & Arsitektur (Solution) *
        </Label>
        <Textarea
          id="solution"
          placeholder="Jelaskan implementasi solusi yang dihadirkan oleh tim engineer Aldera Tech..."
          rows={4}
          value={form.solution}
          onChange={(e) => form.setSolution(e.target.value)}
        />
        {form.errors.solution && (
          <p className="text-xs text-destructive">{form.errors.solution}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="result">Hasil & Dampak Bisnis (Result) *</Label>
        <Textarea
          id="result"
          placeholder="Metrik terukur, efisiensi waktu, peningkatan konversi, atau performa yang dicapai..."
          rows={3}
          value={form.result}
          onChange={(e) => form.setResult(e.target.value)}
        />
        {form.errors.result && (
          <p className="text-xs text-destructive">{form.errors.result}</p>
        )}
      </div>
    </Card>
  );
}
