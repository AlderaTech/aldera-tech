"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, EyeOff, Trash2, Pin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  togglePublishBlogPostAction,
  deleteBlogPostAction,
  togglePinBlogPostAction,
} from "@/lib/actions/blog";

export function BlogRowActions({
  id,
  published,
  isPinned,
}: {
  id: string;
  published: boolean;
  isPinned?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pinned, setPinned] = useState(Boolean(isPinned));
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            disabled={isPending}
            aria-label="Aksi lain"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() =>
              startTransition(async () => {
                try {
                  const res = await togglePinBlogPostAction(id);
                  const nextState = res?.isPinned ?? !pinned;
                  setPinned(nextState);
                  toast.success(
                    nextState ? "Post disematkan" : "Pin post dilepas"
                  );
                  router.refresh();
                } catch (err: unknown) {
                  toast.error(
                    err instanceof Error ? err.message : "Gagal mengubah status pin"
                  );
                }
              })
            }
          >
            <Pin className="size-4" />
            {pinned ? "Lepas Pin" : "Sematkan"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              startTransition(async () => {
                await togglePublishBlogPostAction(id);
                toast.success(
                  published ? "Post di-unpublish" : "Post dipublish"
                );
                router.refresh();
              })
            }
          >
            {published ? (
              <>
                <EyeOff className="size-4" /> Unpublish
              </>
            ) : (
              <>
                <Eye className="size-4" /> Publish
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="size-4" /> Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus post?"
        description="Post blog akan dihapus permanen. Aksi ini tidak bisa di-undo."
        confirmLabel="Hapus post"
        destructive
        pending={isPending}
        onConfirm={() =>
          startTransition(async () => {
            try {
              await deleteBlogPostAction(id);
              toast.success("Post dihapus");
              setDeleteOpen(false);
              router.refresh();
            } catch {
              toast.error("Gagal menghapus");
            }
          })
        }
      />
    </>
  );
}
