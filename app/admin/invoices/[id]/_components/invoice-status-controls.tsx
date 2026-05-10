"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Bell, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { InvoiceStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateInvoiceStatusAction,
  sendInvoiceEmailAction,
  sendReminderAction,
  deleteInvoiceAction,
} from "@/lib/actions/invoice";
import { isNextNavigationError } from "@/lib/is-next-nav-error";

export function InvoiceStatusControls({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
        await sendInvoiceEmailAction(invoiceId);
        toast.success("Invoice dikirim via email");
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
        toast.success("Reminder terkirim");
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      }
    });
  }

  function handleDelete() {
    if (!confirm("Hapus invoice ini? Tidak bisa di-undo.")) return;
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
    <div className="flex items-center flex-wrap gap-2">
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Status</span>
        <Select value={status} onValueChange={handleStatus} disabled={isPending}>
          <SelectTrigger className="w-40">
            <SelectValue />
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
      <Button variant="outline" onClick={handleSend} disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Mail className="size-4" />
        )}
        Kirim Email
      </Button>
      <Button variant="outline" onClick={handleReminder} disabled={isPending}>
        <Bell className="size-4" /> Reminder
      </Button>
      <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
        <Trash2 className="size-4" /> Hapus
      </Button>
    </div>
  );
}
