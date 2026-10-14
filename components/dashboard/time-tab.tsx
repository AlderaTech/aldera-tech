"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Timer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  addManualEntryAction,
  deleteTimeEntryAction,
} from "@/lib/actions/time";
import type { TimeEntryItem } from "./time-tracking/types";
import { TimeSummaryCards } from "./time-tracking/time-summary-cards";
import { ManualEntryForm } from "./time-tracking/manual-entry-form";
import { TimeEntriesTable } from "./time-tracking/time-entries-table";

export type { TimeEntryItem };

export function TimeTab({
  projectId,
  entries,
}: {
  projectId: string;
  entries: TimeEntryItem[];
  currentUserId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [showManual, setShowManual] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<TimeEntryItem | null>(
    null
  );

  function handleAddManual(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    startTransition(async () => {
      const r = await addManualEntryAction(projectId, fd);
      if (r.ok) {
        toast.success("Entry waktu berhasil ditambahkan");
        setShowManual(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(r.error ?? "Gagal menambahkan entry waktu");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteTimeEntryAction(id);
        toast.success("Entry waktu berhasil dihapus");
        setDeleteTarget(null);
        router.refresh();
      } catch {
        toast.error("Gagal menghapus entry waktu");
      }
    });
  }

  const totalSec = entries.reduce((s, e) => s + e.durationSec, 0);
  const billableSec = entries
    .filter((e) => e.billable)
    .reduce((s, e) => s + e.durationSec, 0);

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
            <Timer className="size-5" />
            Time Tracking
          </h2>
          <p className="text-sm text-muted-foreground">
            Catat waktu kerja di proyek ini untuk billing dan produktivitas.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowManual((s) => !s)}
        >
          <Plus className="size-4" /> {showManual ? "Tutup" : "Tambah Manual"}
        </Button>
      </div>

      <TimeSummaryCards
        totalSec={totalSec}
        billableSec={billableSec}
        completedCount={entries.length}
      />

      {showManual && (
        <ManualEntryForm onSubmit={handleAddManual} isPending={isPending} />
      )}

      <TimeEntriesTable
        entries={entries}
        deleteTarget={deleteTarget}
        onSelectDeleteTarget={setDeleteTarget}
        onConfirmDelete={handleDelete}
        isPending={isPending}
      />
    </div>
  );
}
