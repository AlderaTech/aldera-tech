"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { deleteFileAction } from "@/lib/actions/admin";

export function FileCardActions({ fileId }: { fileId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <ConfirmDialog
      title="Hapus file?"
      description="File akan dihapus secara permanen dari sistem dan tidak bisa dipulihkan."
      confirmLabel="Hapus file"
      destructive
      pending={isPending}
      onConfirm={() =>
        startTransition(async () => {
          try {
            await deleteFileAction(fileId);
            toast.success("File dihapus");
            router.refresh();
          } catch {
            toast.error("Gagal menghapus");
          }
        })
      }
      trigger={
        <Button
          size="sm"
          variant="ghost"
          aria-label="Hapus"
          disabled={isPending}
        >
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      }
    />
  );
}
