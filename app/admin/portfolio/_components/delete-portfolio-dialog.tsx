"use client";

import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function DeletePortfolioDialog({
  open,
  title,
  isPending,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  title: string;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Studi Kasus</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus studi kasus{" "}
            <span className="font-semibold text-foreground">
              &ldquo;{title}&rdquo;
            </span>
            ? Aksi ini bersifat permanen dan tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
