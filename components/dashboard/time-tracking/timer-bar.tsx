"use client";

import { Play, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmtDuration, type TimeEntryItem } from "./types";

export function TimerBar({
  running,
  runningSeconds,
  description,
  onDescriptionChange,
  onStart,
  onStop,
  isPending,
}: {
  running?: TimeEntryItem;
  runningSeconds: number;
  description: string;
  onDescriptionChange: (val: string) => void;
  onStart: () => void;
  onStop: (id: string) => void;
  isPending: boolean;
}) {
  return (
    <Card className="space-y-4 border-slate-200 bg-white p-4 shadow-sm">
      {running ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 text-xs text-muted-foreground">
              Sedang berjalan
            </div>
            <div className="font-mono text-2xl font-bold tabular-nums xxxl:text-3xl">
              {fmtDuration(runningSeconds)}
            </div>
            <div className="mt-1 truncate text-sm text-muted-foreground">
              {running.description}
            </div>
          </div>
          <Button
            size="lg"
            variant="destructive"
            onClick={() => onStop(running.id)}
            disabled={isPending}
          >
            <Square className="size-4" /> Stop
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-56 flex-1 space-y-1.5">
            <Label htmlFor="desc">Apa yang Anda kerjakan?</Label>
            <Input
              id="desc"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Review design, debug API…"
            />
          </div>
          <Button onClick={onStart} disabled={isPending} size="lg">
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Play className="size-4" />
            )}
            Mulai Timer
          </Button>
        </div>
      )}
    </Card>
  );
}
