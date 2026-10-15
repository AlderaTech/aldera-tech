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
      const msg = err instanceof Error ? err.message : "Gagal membuat tiket top-up.";
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

  const handleCloseTopup = () => {
    setIsTopupOpen(false);
    setCreatedTopup(null);
    setCustomAmount("");
    setSelectedPreset(100000);
    setCopiedAmount(false);
  };

  const isLowBalance = balance < 5000;

  return (
    <div className="space-y-6">
      {/* Balance Overview Card */}
      <Card className="border shadow-xs bg-gradient-to-br from-white via-slate-50 to-indigo-50/30">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
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
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                {formatCurrency(balance)}
              </span>
              <span className="text-xs text-slate-500 font-medium">IDR</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setIsTopupOpen(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <PlusCircle className="h-4 w-4" />
              Top-up Saldo
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4">
          {isLowBalance ? (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
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
                Saldo dipotong secara otomatis dan transparan sesuai jumlah token
                input/output per panggilan API.
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
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Catatan mutasi saldo resmi dan imutabel dari database ledger
              perbankan internal Aldera.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            {transactions.length} Transaksi
          </Badge>
        </CardHeader>

        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 px-4 text-center">
              <Wallet className="h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-700">
                Belum ada mutasi saldo
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Mutasi top-up dan pemakaian token API Anda akan tercatat di sini.
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
                        <TableCell className="text-xs text-slate-600 font-medium">
                          {formatDate(tx.created_at)}
                        </TableCell>
                        <TableCell>
                          {tx.transaction_type === "topup" ? (
                            <Badge
                              variant="secondary"
                              className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
                            >
                              Top-up
                            </Badge>
                          ) : tx.transaction_type === "usage" ? (
                            <Badge
                              variant="secondary"
                              className="bg-rose-50 text-rose-700 border-rose-200 text-xs"
                            >
                              Pemakaian
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-slate-100 text-slate-700 border-slate-200 text-xs"
                            >
                              Manual
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-xs">
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
                        <TableCell className="text-xs text-slate-600 max-w-[280px] truncate">
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
                        className={`text-xs h-10 ${
                          isSelected
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                            : "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
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
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200/80 text-xs">
                  <span className="text-emerald-800 font-medium">
                    Status Tiket #{createdTopup.id}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 text-amber-800 border-amber-200"
                  >
                    Menunggu Pembayaran
                  </Badge>
                </div>

                <div className="space-y-2 mt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Nominal Pokok:</span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(createdTopup.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Kode Unik Verifikasi:</span>
                    <span className="font-mono font-bold text-emerald-700">
                      +{createdTopup.unique_code}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      Total Transfer Tepat:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-extrabold text-emerald-700 font-mono">
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
              <div className="rounded-lg border p-3.5 space-y-2 text-xs bg-slate-50">
                <p className="font-semibold text-slate-800">
                  Instruksi Transfer Bank:
                </p>
                <div className="space-y-1 text-slate-600 leading-relaxed">
                  <p>
                    • Bank: <strong>BCA (Bank Central Asia)</strong>
                  </p>
                  <p>
                    • No. Rekening:{" "}
                    <code className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border">
                      8420-192-881
                    </code>
                  </p>
                  <p>
                    • Atas Nama: <strong>PT Aldera Solusindo Digital</strong>
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded">
                  ⚠️ <strong>PENTING:</strong> Pastikan Anda mentransfer persis
                  hingga 3 digit terakhir (
                  <strong className="font-mono">
                    Rp {createdTopup.total_transfer.toLocaleString("id-ID")}
                  </strong>
                  ) agar saldo otomatis masuk ke akun Anda.
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  onClick={handleCloseTopup}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
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
