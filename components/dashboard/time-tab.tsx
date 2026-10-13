"use client";

import { Plus, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimeEntryItem } from "./time-tracking/types";
import { useTimeTracker } from "./time-tracking/use-time-tracker";
import { TimerBar } from "./time-tracking/timer-bar";
import { TimeSummaryCards } from "./time-tracking/time-summary-cards";
import { ManualEntryForm } from "./time-tracking/manual-entry-form";
import { TimeEntriesTable } from "./time-tracking/time-entries-table";

export type { TimeEntryItem };

export function TimeTab({
  projectId,
  entries,
  currentUserId,
}: {
  projectId: string;
  entries: TimeEntryItem[];
  currentUserId: string;
}) {
  const {
    description,
    setDescription,
    isPending,
    showManual,
    setShowManual,
    deleteTarget,
    setDeleteTarget,
    running,
    runningSeconds,
    start,
    stop,
    addManual,
    del,
    completed,
    totalSec,
    billableSec,
  } = useTimeTracker({ projectId, entries, currentUserId });

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

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <TimerBar
          running={running}
          runningSeconds={runningSeconds}
          description={description}
          onDescriptionChange={setDescription}
          onStart={start}
          onStop={stop}
          isPending={isPending}
        />
        <TimeSummaryCards
          totalSec={totalSec}
          billableSec={billableSec}
          completedCount={completed.length}
        />
      </div>

      {showManual && (
        <ManualEntryForm onSubmit={addManual} isPending={isPending} />
      )}

      <TimeEntriesTable
        entries={entries}
        deleteTarget={deleteTarget}
        onSelectDeleteTarget={setDeleteTarget}
        onConfirmDelete={del}
        isPending={isPending}
      />
    </div>
  );
}
