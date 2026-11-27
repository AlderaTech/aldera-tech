"use client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ClientCredentialsDialog({
  credentials,
  onClose,
}: {
  credentials: { email: string; password: string } | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={Boolean(credentials)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Akses awal klien</DialogTitle>
          <DialogDescription>
            Simpan dan sampaikan kredensial ini melalui saluran aman. Password
            hanya ditampilkan pada pembuatan akun ini.
          </DialogDescription>
        </DialogHeader>
        <dl className="space-y-2 text-sm">
          <dt>Email</dt>
          <dd>{credentials?.email}</dd>
          <dt>Password sementara</dt>
          <dd className="font-mono break-all">{credentials?.password}</dd>
        </dl>
        <Button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                `${credentials?.email}\n${credentials?.password}`
              );
              toast.success("Kredensial disalin.");
            } catch {
              toast.error("Gagal menyalin kredensial.");
            }
          }}
        >
          Salin kredensial
        </Button>
        <Button variant="outline" onClick={onClose}>
          Lanjut ke proyek
        </Button>
      </DialogContent>
    </Dialog>
  );
}
