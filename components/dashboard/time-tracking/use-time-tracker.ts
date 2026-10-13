"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  startTimerAction,
  stopTimerAction,
  addManualEntryAction,
  deleteTimeEntryAction,
} from "@/lib/actions/time";
import type { TimeEntryItem } from "./types";

export function useTimeTracker({
  projectId,
  entries,
  currentUserId,
}: {
  projectId: string;
  entries: TimeEntryItem[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [description, setDescription] = React.useState("");
  const [isPending, startTransition] = React.useTransition();
  const [showManual, setShowManual] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<TimeEntryItem | null>(
    null
  );

  const running = entries.find(
    (e) => !e.endedAt && e.user.id === currentUserId
  );

  const [nowMs, setNowMs] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const runningSeconds = running
    ? Math.floor((nowMs - new Date(running.startedAt).getTime()) / 1000)
    : 0;

  function start() {
    if (!description.trim()) {
      toast.error("Isi deskripsi dulu");
      return;
    }
    startTransition(async () => {
      await startTimerAction(projectId, description);
      setDescription("");
      router.refresh();
    });
  }

  function stop(id: string) {
    startTransition(async () => {
      await stopTimerAction(id);
      router.refresh();
    });
  }

  function addManual(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await addManualEntryAction(projectId, fd);
      if (r.ok) {
        toast.success("Entry ditambahkan");
        setShowManual(false);
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else {
        toast.error(r.error ?? "Gagal");
      }
    });
  }

  function del(id: string) {
    startTransition(async () => {
      await deleteTimeEntryAction(id);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  // Aggregates
  const completed = entries.filter((e) => e.endedAt);
  const totalSec = completed.reduce((s, e) => s + e.durationSec, 0);
  const billableSec = completed
    .filter((e) => e.billable)
    .reduce((s, e) => s + e.durationSec, 0);

  return {
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
  };
}
