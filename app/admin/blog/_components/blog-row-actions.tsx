"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Eye, EyeOff, Trash2 } from "lucide-react";
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
} from "@/lib/actions/blog";

export function BlogRowActions({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
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
