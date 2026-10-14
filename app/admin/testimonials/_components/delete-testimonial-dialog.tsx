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

export function DeleteTestimonialDialog({
  open,
  clientName,
  isPending,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  clientName: string;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Testimoni</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus ulasan testimoni dari{" "}
            <span className="font-semibold text-foreground">
              &ldquo;{clientName}&rdquo;
            </span>
            ? Aksi ini permanen dan tidak dapat dibatalkan.
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
