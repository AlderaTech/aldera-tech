"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ManualEntryForm({
  onSubmit,
  isPending,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
}) {
  return (
    <Card className="border-slate-200 bg-white p-4 shadow-sm">
      <form
        onSubmit={onSubmit}
        className="grid items-end gap-3 sm:grid-cols-[1fr_120px_120px_auto]"
      >
        <div className="space-y-1.5">
          <Label htmlFor="m-desc" className="text-xs">
            Deskripsi
          </Label>
          <Input
            id="m-desc"
            name="description"
            placeholder="Deskripsi pekerjaan"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="m-minutes" className="text-xs">
            Menit
          </Label>
          <Input
            id="m-minutes"
            name="minutes"
            type="number"
            min="1"
            placeholder="60"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Billable</Label>
          <select
            name="billable"
            defaultValue="true"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="true">Ya</option>
            <option value="false">Tidak</option>
          </select>
        </div>
        <Button type="submit" disabled={isPending}>
          Simpan
        </Button>
      </form>
    </Card>
  );
}
