"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Play, Pause, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  toggleRecurringActiveAction,
  deleteRecurringAction,
} from "@/lib/actions/recurring-invoice";

export function RecurringRowActions({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="ghost"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await toggleRecurringActiveAction(id);
            toast.success(active ? "Dipause" : "Diaktifkan");
            router.refresh();
          })
        }
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : active ? (
          <Pause className="size-3.5" />
        ) : (
          <Play className="size-3.5" />
        )}
        {active ? "Pause" : "Aktifkan"}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        disabled={isPending}
        aria-label="Hapus"
        onClick={() => {
          if (!confirm("Hapus template ini?")) return;
          startTransition(async () => {
            await deleteRecurringAction(id);
            toast.success("Template dihapus");
            router.refresh();
          });
        }}
      >
        <Trash2 className="size-3.5 text-destructive" />
      </Button>
    </div>
  );
}
