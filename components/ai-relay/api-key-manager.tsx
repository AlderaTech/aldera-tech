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
      const msg = err instanceof Error ? err.message : "Gagal mencabut API Key.";
      toast.error(msg);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <Card className="border shadow-xs">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Key className="h-5 w-5 text-indigo-600" />
            Manajemen API Key
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Gunakan API Key virtual ini untuk menghubungkan model AI ke IDE
            (Cursor, Cline, Roo Code, Continue) atau SDK OpenAI-compatible Anda.
          </CardDescription>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Buat API Key Baru
        </Button>
      </CardHeader>

      <CardContent>
        {keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 px-4 text-center">
            <div className="rounded-full bg-indigo-50 p-3 text-indigo-600 mb-3">
              <Key className="h-6 w-6" />
            </div>
            <h3 className="text-base font-medium">Belum ada API Key aktif</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
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
                      <code className="rounded bg-slate-100 px-2 py-1 text-xs font-mono font-medium text-slate-800">
                        {k.key_prefix}...
                      </code>
                    </TableCell>
                    <TableCell>
                      {k.is_active ? (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          Aktif
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-500 border-slate-200"
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
                      {k.last_used_at ? formatDate(k.last_used_at) : "Belum pernah"}
                    </TableCell>
                    <TableCell className="text-right">
                      {k.is_active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRevokeTarget(k)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
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
              Beri nama label yang deskriptif untuk memudahkan identifikasi tempat
              kunci ini digunakan.
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
                  <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-semibold text-amber-800">
                      Simpan Kunci Anda Sekarang!
                    </p>
                    <p className="mt-0.5">
                      Demi alasan keamanan, kunci rahasia ini{" "}
                      <strong>hanya ditampilkan sekali ini saja</strong>. Salin dan
                      simpan di file environment atau password manager Anda.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">
                  API Key Rahasia (56 Karakter)
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md border bg-slate-50 p-2.5 text-xs font-mono font-medium text-slate-900 break-all select-all">
                    {newlyCreatedKey}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopyNewKey}
                    className="shrink-0 gap-1.5 h-10 px-3 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
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
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center">Cabut API Key?</DialogTitle>
            <DialogDescription className="text-center">
              Apakah Anda yakin ingin mencabut API Key{" "}
              <strong>&ldquo;{revokeTarget?.label}&rdquo;</strong> (
              <code className="text-xs font-mono">{revokeTarget?.key_prefix}...</code>
              )? Panggilan API yang menggunakan kunci ini akan langsung ditolak.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
              className="bg-rose-600 hover:bg-rose-700 text-white"
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
