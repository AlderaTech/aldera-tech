"use client";

import { useState } from "react";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Copy,
  CreditCard,
  History,
  Info,
  Loader2,
  PlusCircle,
  RefreshCw,
  Wallet,
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
  createTopupRequest,
  getBalanceTransactions,
  getUserBalance,
  uploadTopupProof,
  type BalanceTransactionRecord,
  type TopupRequestRecord,
} from "@/lib/actions/ai-relay";
import { formatCurrency, formatDate } from "@/lib/utils";

const TOPUP_PRESETS = [25000, 50000, 100000, 250000, 500000, 1000000];

interface BalanceTopupCardProps {
  initialBalance: number;
  initialTransactions: BalanceTransactionRecord[];
}

export function BalanceTopupCard({
  initialBalance,
  initialTransactions,
}: BalanceTopupCardProps) {
  const [balance, setBalance] = useState<number>(initialBalance);
  const [transactions, setTransactions] =
    useState<BalanceTransactionRecord[]>(initialTransactions);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Top-up Modal State
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number>(100000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isSubmittingTopup, setIsSubmittingTopup] = useState(false);
  const [createdTopup, setCreatedTopup] = useState<TopupRequestRecord | null>(
    null
  );
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [uploadedProofId, setUploadedProofId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [balRes, txRes] = await Promise.all([
        getUserBalance(),
        getBalanceTransactions(50),
      ]);
      setBalance(balRes.balance);
      setTransactions(txRes);
      toast.success("Saldo dan riwayat mutasi diperbarui.");
    } catch {
      toast.error("Gagal menyegarkan data saldo.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    const nominal = customAmount ? Number(customAmount) : selectedPreset;

    if (!nominal || nominal < 10000) {
      toast.error("Minimal top-up adalah Rp 10.000.");
      return;
    }

    setIsSubmittingTopup(true);
    try {
      const res = await createTopupRequest(nominal);
      if (res.success) {
        setCreatedTopup(res.topup);
        toast.success("Tiket top-up berhasil dibuat!");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal membuat tiket top-up.";
      toast.error(msg);
    } finally {
      setIsSubmittingTopup(false);
    }
  };

  const handleCopyTotal = async () => {
    if (!createdTopup) return;
    try {
      await navigator.clipboard.writeText(String(createdTopup.total_transfer));
      setCopiedAmount(true);
      toast.success("Nominal tepat disalin!");
      setTimeout(() => setCopiedAmount(false), 2000);
    } catch {
      toast.error("Gagal menyalin nominal.");
    }
  };

  const handleUploadProof = async () => {
    if (!createdTopup) return;
    if (!proofFile) {
      toast.error("Pilih file bukti transfer terlebih dahulu.");
      return;
    }
    setIsUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append("file", proofFile);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Gagal mengunggah file bukti transfer.");
      }
      const uploadData = await res.json();
      const fileId = uploadData.url || uploadData.id || uploadData.path;
      const proofRes = await uploadTopupProof(createdTopup.id, fileId);
      if (proofRes.success) {
        setUploadedProofId(fileId);
        setCreatedTopup(proofRes.topup);
        toast.success("Bukti transfer berhasil diunggah!");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal mengunggah bukti transfer."
      );
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleCloseTopup = () => {
    setIsTopupOpen(false);
    setCreatedTopup(null);
    setCustomAmount("");
    setSelectedPreset(100000);
    setCopiedAmount(false);
    setProofFile(null);
    setUploadedProofId(null);
  };

  const isLowBalance = balance < 5000;

  return (
    <div className="space-y-6">
      {/* Balance Overview Card */}
      <Card className="border bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 shadow-xs">
        <CardHeader className="flex flex-col gap-4 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Saldo Akun AI Relay
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-6 w-6 text-slate-400 hover:text-slate-700"
                title="Segarkan Saldo"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                {formatCurrency(balance)}
              </span>
              <span className="text-xs font-medium text-slate-500">IDR</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setIsTopupOpen(true)}
              className="gap-2 bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
            >
              <PlusCircle className="h-4 w-4" />
              Top-up Saldo
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4">
          {isLowBalance ? (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-800">
                  Saldo Anda di bawah ambang batas (Rp 5.000)
                </p>
                <p className="mt-0.5 text-amber-700">
                  Panggilan API atau pengujian di Playground akan terhenti jika
                  saldo habis. Lakukan top-up untuk memastikan kelancaran
                  workflow Anda.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Info className="h-4 w-4 text-slate-400" />
              <span>
                Saldo dipotong secara otomatis dan transparan sesuai jumlah
                token input/output per panggilan API.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ledger History (Riwayat Mutasi Saldo) */}
      <Card className="border shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <History className="h-5 w-5 text-slate-600" />
              Riwayat Mutasi Saldo (Ledger)
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs text-muted-foreground">
              Catatan mutasi saldo resmi dan imutabel dari database ledger
              perbankan internal Aldera.
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs">
            {transactions.length} Transaksi
          </Badge>
        </CardHeader>

        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-4 py-10 text-center">
              <Wallet className="mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">
                Belum ada mutasi saldo
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Mutasi top-up dan pemakaian token API Anda akan tercatat di
                sini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="w-[160px]">Waktu</TableHead>
                    <TableHead className="w-[120px]">Tipe</TableHead>
                    <TableHead>Nominal</TableHead>
                    <TableHead>Saldo Sebelum</TableHead>
                    <TableHead>Saldo Sesudah</TableHead>
                    <TableHead>Keterangan / Ref</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => {
                    const isCredit = tx.amount > 0;
                    return (
                      <TableRow key={tx.id} className="hover:bg-slate-50/50">
                        <TableCell className="text-xs font-medium text-slate-600">
                          {formatDate(tx.created_at)}
                        </TableCell>
                        <TableCell>
                          {tx.transaction_type === "topup" ? (
                            <Badge
                              variant="secondary"
                              className="border-emerald-200 bg-emerald-50 text-xs text-emerald-700"
                            >
                              Top-up
                            </Badge>
                          ) : tx.transaction_type === "usage" ? (
                            <Badge
                              variant="secondary"
                              className="border-rose-200 bg-rose-50 text-xs text-rose-700"
                            >
                              Pemakaian
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="border-slate-200 bg-slate-100 text-xs text-slate-700"
                            >
                              Manual
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">
                          <span
                            className={`inline-flex items-center gap-0.5 ${
                              isCredit ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {isCredit ? (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDownRight className="h-3.5 w-3.5" />
                            )}
                            {formatCurrency(Math.abs(tx.amount))}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {formatCurrency(tx.balance_before)}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-800">
                          {formatCurrency(tx.balance_after)}
                        </TableCell>
                        <TableCell className="max-w-[280px] truncate text-xs text-slate-600">
                          {tx.notes || tx.reference_id || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top-up Flow Modal */}
      <Dialog open={isTopupOpen} onOpenChange={handleCloseTopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Top-up Saldo AI Relay
            </DialogTitle>
            <DialogDescription>
              Pilih nominal top-up. Kami menggunakan sistem kode unik 3-digit
              untuk verifikasi transfer otomatis.
            </DialogDescription>
          </DialogHeader>

          {!createdTopup ? (
            <form onSubmit={handleCreateTopup} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Pilihan Nominal Cepat
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {TOPUP_PRESETS.map((preset) => {
                    const isSelected =
                      selectedPreset === preset && !customAmount;
                    return (
                      <Button
                        key={preset}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => {
                          setSelectedPreset(preset);
                          setCustomAmount("");
                        }}
                        className={`h-10 text-xs ${
                          isSelected
                            ? "bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                            : "hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        {formatCurrency(preset)}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <Label
                  htmlFor="custom-amount"
                  className="text-xs font-semibold text-slate-700"
                >
                  Atau Masukkan Nominal Kustom (Rp)
                </Label>
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder="Contoh: 150000"
                  min={10000}
                  step={5000}
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                  }}
                  disabled={isSubmittingTopup}
                />
                <p className="text-[11px] text-muted-foreground">
                  Minimal top-up: Rp 10.000.
                </p>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseTopup}
                  disabled={isSubmittingTopup}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingTopup}
                  className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {isSubmittingTopup ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Lanjut Pembayaran"
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 text-emerald-950">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2 text-xs">
                  <span className="font-medium text-emerald-800">
                    Status Tiket #{createdTopup.id}
                  </span>
                  <Badge
                    variant="secondary"
                    className="border-amber-200 bg-amber-100 text-amber-800"
                  >
                    Menunggu Pembayaran
                  </Badge>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Nominal Pokok:</span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(createdTopup.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      Kode Unik Verifikasi:
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      +{createdTopup.unique_code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-emerald-200/80 pt-2">
                    <span className="font-semibold text-slate-900">
                      Total Transfer Tepat:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-lg font-extrabold text-emerald-700">
                        {formatCurrency(createdTopup.total_transfer)}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={handleCopyTotal}
                        className="h-7 w-7 text-emerald-700 hover:bg-emerald-100"
                        title="Salin Total Transfer"
                      >
                        {copiedAmount ? (
                          <Check className="h-4 w-4 text-emerald-800" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank & Payment Instructions */}
              <div className="space-y-2 rounded-lg border bg-slate-50 p-3.5 text-xs">
                <p className="font-semibold text-slate-800">
                  Instruksi Transfer Bank:
                </p>
                <div className="space-y-1 leading-relaxed text-slate-600">
                  <p>
                    • Bank: <strong>BCA (Bank Central Asia)</strong>
                  </p>
                  <p>
                    • No. Rekening:{" "}
                    <code className="rounded border bg-white px-1.5 py-0.5 font-mono font-bold text-slate-900">
                      8012-3456-7890
                    </code>
                  </p>
                  <p>
                    • Atas Nama: <strong>PT Aldera Solusindo Mandiri</strong>
                  </p>
                </div>
                <div className="mt-2 rounded border-t bg-amber-50/70 p-2 pt-2 text-[11px] text-amber-800">
                  ⚠️ <strong>PENTING:</strong> Pastikan Anda mentransfer persis
                  hingga 3 digit terakhir (
                  <strong className="font-mono">
                    Rp {createdTopup.total_transfer.toLocaleString("id-ID")}
                  </strong>
                  ) agar saldo otomatis masuk ke akun Anda.
                </div>
              </div>

              {/* Form Upload Bukti Transfer */}
              <div className="space-y-3 rounded-lg border bg-white p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-800">
                    Upload Bukti Transfer:
                  </p>
                  {(createdTopup.proof_file_id || uploadedProofId) && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"
                    >
                      <Check className="size-3" /> Bukti Terunggah
                    </Badge>
                  )}
                </div>
                {createdTopup.proof_file_id || uploadedProofId ? (
                  <div className="flex items-center justify-between rounded border bg-slate-50 p-2.5 text-xs text-muted-foreground">
                    <span className="max-w-[200px] truncate font-mono">
                      {createdTopup.proof_file_id || uploadedProofId}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-600">
                      Menunggu verifikasi admin
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) =>
                          setProofFile(e.target.files?.[0] || null)
                        }
                        disabled={isUploadingProof}
                        className="h-9 text-xs file:text-xs file:font-medium"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={!proofFile || isUploadingProof}
                        onClick={handleUploadProof}
                        className="h-9 shrink-0 bg-brand-primary px-3 text-xs text-white hover:bg-brand-primary-hover"
                      >
                        {isUploadingProof ? (
                          <>
                            <Loader2 className="mr-1 size-3.5 animate-spin" />
                            Mengunggah...
                          </>
                        ) : (
                          "Kirim Bukti"
                        )}
                      </Button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Format: PNG, JPG, JPEG, WEBP, atau PDF (maks. 5MB)
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  onClick={handleCloseTopup}
                  className="w-full bg-slate-900 text-white hover:bg-slate-800"
                >
                  Saya Sudah Transfer / Tutup
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
