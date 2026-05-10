"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { BlogCategoryRow } from "../_utils/category-types";

export function DeleteCategoryDialog({
  target,
  pending,
  onOpenChange,
  onConfirm,
}: {
  target: BlogCategoryRow | null;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmDialog
      open={Boolean(target)}
      onOpenChange={onOpenChange}
      title="Hapus kategori blog?"
      description={
        target
          ? `${target._count.posts} post akan kehilangan kategori ini, tetapi artikelnya tetap tersimpan.`
          : "Kategori akan dihapus."
      }
      confirmLabel="Hapus kategori"
      destructive
      pending={pending}
      onConfirm={onConfirm}
    />
  );
}
