"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      toast.success("Pengaturan disimpan");
    });
  }

  return (
    <Card className="p-4">
      <form action={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <Label>Disclaimer Fitur</Label>
          <Textarea
            name="featureDisclaimer"
            rows={4}
            defaultValue={config?.featureDisclaimer || ""}
          />
        </div>
        <div>
          <Label>Kebijakan Revisi</Label>
          <Textarea
            name="revisionPolicy"
            rows={5}
            defaultValue={config?.revisionPolicy || ""}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Jatah Revisi Gratis</Label>
            <Input
              name="freeRevisions"
              type="number"
              defaultValue={config?.freeRevisions ?? 2}
            />
          </div>
          <div>
            <Label>Harga Revisi/Fitur</Label>
            <Input
              name="revisionPricePerItem"
              type="number"
              defaultValue={config?.revisionPricePerItem ?? 300000}
            />
          </div>
          <div>
            <Label>Multiplier Urgent (x)</Label>
            <Input
              name="urgencyMultiplier"
              type="number"
              step="0.1"
              defaultValue={config?.urgencyMultiplier ?? 1.5}
            />
          </div>
          <div>
            <Label>Threshold Urgent (hari)</Label>
            <Input
              name="urgencyThresholdDays"
              type="number"
              defaultValue={config?.urgencyThresholdDays ?? 14}
            />
          </div>
          <div>
            <Label>DP (%)</Label>
            <Input
              name="dpPercentage"
              type="number"
              min={0}
              max={100}
              defaultValue={config?.dpPercentage ?? 25}
            />
          </div>
        </div>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Simpan Pengaturan
        </Button>
      </form>
    </Card>
  );
}
