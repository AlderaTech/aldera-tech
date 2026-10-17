"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Key,
  Plus,
  ShieldAlert,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createApiKey,
  revokeApiKey,
  type ApiKeyRecord,
} from "@/lib/actions/ai-relay";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ApiKeyManagerProps {
  initialKeys: ApiKeyRecord[];
}

export function ApiKeyManager({ initialKeys }: ApiKeyManagerProps) {
  const [keys, setKeys] = useState<ApiKeyRecord[]>(initialKeys);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Revocation state
  const [revokeTarget, setRevokeTarget] = useState<ApiKeyRecord | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createApiKey(label);
      if (res.success) {
        setNewlyCreatedKey(res.rawKey);
        setKeys((prev) => [
          {
            id: res.id,
            user_id: 0,
            key_prefix: res.keyPrefix,
            label: res.label,
            is_active: true,
            total_spent: 0,
            last_used_at: null,
            created_at: new Date(),
          },
          ...prev,
        ]);
        toast.success("API Key berhasil dibuat!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat API Key.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyNewKey = async () => {
    if (!newlyCreatedKey) return;
    try {
      await navigator.clipboard.writeText(newlyCreatedKey);
      setCopiedKey(true);
      toast.success("API Key disalin ke clipboard!");
      setTimeout(() => setCopiedKey(false), 2500);
    } catch {
      toast.error("Gagal menyalin API Key.");
    }
  };

  const handleCloseCreateModal = () => {
    setIsCreateOpen(false);
    setNewlyCreatedKey(null);
    setLabel("");
    setCopiedKey(false);
  };

  const handleConfirmRevoke = async () => {
    if (!revokeTarget) return;
    setIsRevoking(true);
    try {
      const res = await revokeApiKey(revokeTarget.id);
      if (res.success) {
        setKeys((prev) =>
          prev.map((k) =>
            k.id === revokeTarget.id ? { ...k, is_active: false } : k
          )
        );
        toast.success(`API Key '${revokeTarget.label}' berhasil dicabut.`);
        setRevokeTarget(null);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal mencabut API Key.";
      toast.error(msg);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <Card className="border shadow-xs">
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Key className="h-5 w-5 text-indigo-600" />
            Manajemen API Key
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-muted-foreground">
            Gunakan API Key virtual ini untuk menghubungkan model AI ke IDE
            (Cursor, Cline, Roo Code, Continue) atau SDK OpenAI-compatible Anda.
          </CardDescription>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 self-start bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Buat API Key Baru
        </Button>
      </CardHeader>

      <CardContent>
        {keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-12 text-center">
            <div className="mb-3 rounded-full bg-indigo-50 p-3 text-indigo-600">
              <Key className="h-6 w-6" />
            </div>
            <h3 className="text-base font-medium">Belum ada API Key aktif</h3>
            <p className="mt-1 mb-4 max-w-sm text-sm text-muted-foreground">
              Buat API Key pertama Anda untuk mulai menguji prompt di Playground
              atau menghubungkannya ke editor kode favorit Anda.
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Buat API Key
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="w-[180px]">Label</TableHead>
                  <TableHead className="w-[200px]">Prefix Kunci</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Terpakai</TableHead>
                  <TableHead>Dibuat</TableHead>
                  <TableHead>Terakhir Digunakan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((k) => (
                  <TableRow key={k.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900">
                      {k.label}
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-800">
                        {k.key_prefix}...
                      </code>
                    </TableCell>
                    <TableCell>
                      {k.is_active ? (
                        <Badge
                          variant="secondary"
                          className="border-emerald-200 bg-emerald-50 text-emerald-700"
                        >
                          Aktif
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="border-slate-200 bg-slate-100 text-slate-500"
                        >
                          Dicabut
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-700">
                      {formatCurrency(k.total_spent)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(k.created_at)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {k.last_used_at
                        ? formatDate(k.last_used_at)
                        : "Belum pernah"}
                    </TableCell>
                    <TableCell className="text-right">
                      {k.is_active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRevokeTarget(k)}
                          className="h-8 px-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Cabut
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Creation Modal */}
      <Dialog open={isCreateOpen} onOpenChange={handleCloseCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat API Key Baru</DialogTitle>
            <DialogDescription>
              Beri nama label yang deskriptif untuk memudahkan identifikasi
              tempat kunci ini digunakan.
            </DialogDescription>
          </DialogHeader>

          {!newlyCreatedKey ? (
            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="key-label">Label Kunci</Label>
                <Input
                  id="key-label"
                  placeholder="Misal: Cursor Mac Studio, Cline Web Extension"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  disabled={isSubmitting}
                  autoFocus
                  required
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseCreateModal}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !label.trim()}
                  className="bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Membuat...
                    </>
                  ) : (
                    "Buat Kunci"
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-amber-900">
                <div className="flex gap-2.5">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-semibold text-amber-800">
                      Simpan Kunci Anda Sekarang!
                    </p>
                    <p className="mt-0.5">
                      Demi alasan keamanan, kunci rahasia ini{" "}
                      <strong>hanya ditampilkan sekali ini saja</strong>. Salin
                      dan simpan di file environment atau password manager Anda.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  API Key Rahasia (56 Karakter)
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md border bg-slate-50 p-2.5 font-mono text-xs font-medium break-all text-slate-900 select-all">
                    {newlyCreatedKey}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyNewKey}
                    className="h-10 shrink-0 gap-1.5 border-indigo-200 px-3 text-indigo-700 hover:bg-indigo-50"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Salin
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="w-full bg-slate-900 text-white hover:bg-slate-800"
                >
                  Saya Sudah Menyimpannya
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revocation Confirmation Dialog */}
      <Dialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center">Cabut API Key?</DialogTitle>
            <DialogDescription className="text-center">
              Apakah Anda yakin ingin mencabut API Key{" "}
              <strong>&ldquo;{revokeTarget?.label}&rdquo;</strong> (
              <code className="font-mono text-xs">
                {revokeTarget?.key_prefix}...
              </code>
              )? Panggilan API yang menggunakan kunci ini akan langsung ditolak.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRevokeTarget(null)}
              disabled={isRevoking}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmRevoke}
              disabled={isRevoking}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {isRevoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mencabut...
                </>
              ) : (
                "Ya, Cabut Kunci"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
