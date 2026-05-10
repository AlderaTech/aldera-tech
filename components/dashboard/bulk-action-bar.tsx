"use client";

import * as React from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BulkAction = {
  label: string;
  icon?: React.ReactNode;
  onClick: (ids: string[]) => Promise<void> | void;
  destructive?: boolean;
  confirm?: string; // if set, show confirm dialog
};

export function BulkActionBar({
  selectedIds,
  onClear,
  actions,
}: {
  selectedIds: string[];
  onClear: () => void;
  actions: BulkAction[];
}) {
  const [pendingLabel, setPendingLabel] = React.useState<string | null>(null);
  if (selectedIds.length === 0) return null;

  async function run(action: BulkAction) {
    if (action.confirm) {
      const confirmed = confirm(
        action.confirm.replace("{count}", String(selectedIds.length))
      );
      if (!confirmed) return;
    }
    setPendingLabel(action.label);
    try {
      await action.onClick(selectedIds);
    } finally {
      setPendingLabel(null);
    }
  }

  return (
    <div
      className={cn(
        "sticky top-[72px] z-20 flex items-center flex-wrap gap-2 rounded-lg border bg-background/95 backdrop-blur px-4 py-2 shadow-md",
        "animate-in fade-in-0 slide-in-from-top-2 duration-200"
      )}
    >
      <Button
        size="icon"
        variant="ghost"
        onClick={onClear}
        aria-label="Clear selection"
      >
        <X className="size-4" />
      </Button>
      <span className="text-sm font-medium">
        {selectedIds.length} item terpilih
      </span>
      <div className="flex-1" />
      {actions.map((action) => (
        <Button
          key={action.label}
          size="sm"
          variant={action.destructive ? "destructive" : "outline"}
          disabled={pendingLabel !== null}
          onClick={() => run(action)}
        >
          {pendingLabel === action.label ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            action.icon
          )}
          {action.label}
        </Button>
      ))}
    </div>
  );
}
