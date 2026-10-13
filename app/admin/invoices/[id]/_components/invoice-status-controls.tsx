"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Bell, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { InvoiceStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateInvoiceStatusAction,
  sendInvoiceWhatsAppAction,
  sendReminderAction,
  deleteInvoiceAction,
} from "@/lib/actions/invoice";
import { isNextNavigationError } from "@/lib/is-next-nav-error";
import { cn } from "@/lib/utils";

export function InvoiceStatusControls({
  invoiceId,
  status,
  className,
}: {
  invoiceId: string;
  status: InvoiceStatus;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<
    "send" | "reminder" | "delete" | null
  >(null);

  function handleStatus(value: string) {
    startTransition(async () => {
      try {
        await updateInvoiceStatusAction(invoiceId, value as InvoiceStatus);
        toast.success("Status diperbarui");
        router.refresh();
      } catch {
        toast.error("Gagal memperbarui");
      }
    });
  }

  function handleSend() {
    startTransition(async () => {
      try {
        await sendInvoiceWhatsAppAction(invoiceId);
        toast.success("Invoice dikirim via WhatsApp");
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleReminder() {
    startTransition(async () => {
      try {
        await sendReminderAction(invoiceId);
        toast.success("Reminder terkirim via WhatsApp");
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteInvoiceAction(invoiceId);
      } catch (err) {
        if (isNextNavigationError(err)) throw err;
        toast.error("Gagal menghapus");
      }
    });
  }

  return (
    <>
      <div
        className={cn(
          "flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm",
          className
        )}
      >
        <div className="min-w-44 space-y-1.5">
          <span className="text-xs font-medium tracking-[0.12em] text-slate-500 uppercase">
            Status
          </span>
          <Select
            value={status}
            onValueChange={handleStatus}
            disabled={isPending}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Pilih status invoice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SENT">Terkirim</SelectItem>
              <SelectItem value="PAID">Lunas</SelectItem>
              <SelectItem value="OVERDUE">Lewat Tempo</SelectItem>
              <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => setConfirmAction("send")}
          disabled={isPending}
          className="h-10"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MessageSquare className="size-4" />
          )}
          Kirim WhatsApp
        </Button>
        <Button
          variant="outline"
          onClick={() => setConfirmAction("reminder")}
          disabled={isPending}
          className="h-10"
        >
          <Bell className="size-4" /> Reminder
        </Button>
        <Button
          variant="destructive"
          onClick={() => setConfirmAction("delete")}
          disabled={isPending}
          className="h-10"
        >
          <Trash2 className="size-4" /> Hapus
        </Button>
      </div>
      <ConfirmDialog
        open={confirmAction === "send"}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title="Kirim invoice ke WhatsApp klien?"
        description="Invoice akan dikirim ke nomor WhatsApp klien yang terdaftar."
        confirmLabel="Kirim WhatsApp"
        pending={isPending}
        onConfirm={handleSend}
      />
      <ConfirmDialog
        open={confirmAction === "reminder"}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title="Kirim reminder pembayaran via WhatsApp?"
        description="Reminder pembayaran akan dikirim via WhatsApp ke klien untuk invoice ini."
        confirmLabel="Kirim reminder"
        pending={isPending}
        onConfirm={handleReminder}
      />
      <ConfirmDialog
        open={confirmAction === "delete"}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title="Hapus invoice?"
        description="Invoice akan dihapus permanen. Aksi ini tidak bisa di-undo."
        confirmLabel="Hapus invoice"
        destructive
        pending={isPending}
        onConfirm={handleDelete}
      />
    </>
  );
}
