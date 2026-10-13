"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateOrderRequestStatus } from "@/lib/actions/calculator";

export function OrderActions({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();

  if (status !== "PENDING" && status !== "REVIEWED") return null;

  function handle(newStatus: "REVIEWED" | "CONVERTED" | "CANCELLED") {
    start(async () => {
      await updateOrderRequestStatus(id, newStatus);
      toast.success(`Status diubah ke ${newStatus}`);
    });
  }

  return (
    <div className="mt-2 flex gap-2">
      {status === "PENDING" && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handle("REVIEWED")}
          disabled={pending}
        >
          Mark Reviewed
        </Button>
      )}
      <Button size="sm" onClick={() => handle("CONVERTED")} disabled={pending}>
        Convert
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handle("CANCELLED")}
        disabled={pending}
      >
        Cancel
      </Button>
    </div>
  );
}
