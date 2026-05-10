"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteFileAction } from "@/lib/actions/admin";

export function FileCardActions({ fileId }: { fileId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="ghost"
      aria-label="Hapus"
      onClick={() => {
        if (!confirm("Hapus file ini secara permanen?")) return;
        startTransition(async () => {
          try {
            await deleteFileAction(fileId);
            toast.success("File dihapus");
            router.refresh();
          } catch {
            toast.error("Gagal menghapus");
          }
        });
      }}
      disabled={isPending}
    >
      <Trash2 className="size-3.5 text-destructive" />
    </Button>
  );
}
