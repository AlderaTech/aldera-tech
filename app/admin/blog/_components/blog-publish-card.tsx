"use client";

import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BlogFormInitial } from "../_utils/blog-form-types";
import type { useBlogForm } from "../_hooks/use-blog-form";

type BlogFormState = ReturnType<typeof useBlogForm>;

export function BlogPublishCard({
  form,
  initial,
}: {
  form: BlogFormState;
  initial?: BlogFormInitial;
}) {
  const { values, setters, draft, state } = form;

  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="published">Status</Label>
          <p className="text-xs text-muted-foreground">
            {values.published
              ? "Terpublish"
              : values.scheduledAt
                ? `Terjadwal ${new Date(values.scheduledAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}`
                : "Draft"}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={values.published}
          onClick={() => setters.setPublished((published) => !published)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            values.published ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block size-4 transform rounded-full bg-background transition-transform ${
              values.published ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {!values.published && (
        <div className="space-y-2 border-t pt-2">
          <Label htmlFor="scheduledAt" className="text-xs">
            Jadwalkan publish (opsional)
          </Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={values.scheduledAt}
            onChange={(event) => setters.setScheduledAt(event.target.value)}
            className="text-xs"
            placeholder="Pilih waktu publish"
          />
          {values.scheduledAt && (
            <button
              type="button"
              onClick={() => setters.setScheduledAt("")}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Hapus jadwal
            </button>
          )}
        </div>
      )}

      {initial?.id && (draft.lastSavedAt || draft.isSaving) && (
        <div className="flex items-center gap-1.5 border-t pt-2 text-xs text-muted-foreground">
          {draft.isSaving ? (
            <>
              <Loader2 className="size-3 animate-spin" /> Menyimpan draft...
            </>
          ) : draft.lastSavedAt ? (
            <>
              <span className="size-1.5 rounded-full bg-success" />
              Draft tersimpan{" "}
              {draft.lastSavedAt.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </>
          ) : null}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={state.isPending}>
        {state.isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Menyimpan...
          </>
        ) : (
          <>
            <Save className="size-4" /> Simpan
          </>
        )}
      </Button>
    </Card>
  );
}
