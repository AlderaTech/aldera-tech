"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { inviteUserAction } from "@/lib/actions/admin";

export function InviteUserDialog({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await inviteUserAction(fd);
      if (result.ok) {
        toast.success(result.message);
        setTempPassword(result.tempPassword ?? null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleCopy() {
    if (!tempPassword) return;
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setTempPassword(null);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && reset()}>
      <DialogTrigger asChild onClick={() => setOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent>
        {tempPassword ? (
          <>
            <DialogHeader>
              <DialogTitle>User dibuat 🎉</DialogTitle>
              <DialogDescription>
                Berikan password sementara berikut ke user. Mereka harus
                mengubahnya setelah login pertama.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted rounded-md p-4 flex items-center justify-between gap-3">
              <code className="font-mono text-sm break-all">{tempPassword}</code>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="size-4" /> Disalin
                  </>
                ) : (
                  <>
                    <Copy className="size-4" /> Salin
                  </>
                )}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={reset}>Tutup</Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Invite Pengguna</DialogTitle>
              <DialogDescription>
                Buat akun baru dan password sementara.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="inv-name">Nama</Label>
                <Input
                  id="inv-name"
                  name="name"
                  placeholder="Nama lengkap pengguna"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-email">Email</Label>
                <Input
                  id="inv-email"
                  name="email"
                  type="email"
                  placeholder="user@perusahaan.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-company">Perusahaan (opsional)</Label>
                <Input
                  id="inv-company"
                  name="company"
                  placeholder="Nama perusahaan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-role">Role</Label>
                <Select name="role" defaultValue="CLIENT">
                  <SelectTrigger id="inv-role">
                    <SelectValue placeholder="Pilih role pengguna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">Client</SelectItem>
                    <SelectItem value="DEVELOPER">Developer</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Membuat…
                  </>
                ) : (
                  "Buat User"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
