"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bot,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  RefreshCw,
  QrCode,
  Building,
  Wallet,
  ExternalLink,
  HelpCircle,
  Hash,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { TelegramTipTapEditor } from "@/components/editor/telegram-tiptap-editor";
import {
  updateTelegramBotConfigAction,
  createPaymentMethodAction,
  updatePaymentMethodAction,
  togglePaymentMethodAction,
  deletePaymentMethodAction,
  type PaymentMethodItem,
} from "@/lib/actions/telegram-bot";

interface TelegramBotAdminClientViewProps {
  initialConfig: {
    id: string;
    ticketTemplate: string;
    importantNotes: string;
    nextStepsNotes: string;
    topupAmounts: number[];
    adminTelegramUsername: string;
    welcomeText?: string | null;
    helpText?: string | null;
  };
  initialPaymentMethods: PaymentMethodItem[];
}

export function TelegramBotAdminClientView({
  initialConfig,
  initialPaymentMethods,
}: TelegramBotAdminClientViewProps) {
  const router = useRouter();

  // Tab 1: Bot CMS State
  const [ticketTemplate, setTicketTemplate] = React.useState(initialConfig.ticketTemplate);
  const [importantNotes, setImportantNotes] = React.useState(initialConfig.importantNotes);
  const [nextStepsNotes, setNextStepsNotes] = React.useState(initialConfig.nextStepsNotes);
  const [adminUsername, setAdminUsername] = React.useState(initialConfig.adminTelegramUsername);
  const [topupAmounts, setTopupAmounts] = React.useState<number[]>(initialConfig.topupAmounts);
  const [newAmountInput, setNewAmountInput] = React.useState("");
  const [isSavingConfig, setIsSavingConfig] = React.useState(false);

  // Tab 2: Payment Methods State
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethodItem[]>(initialPaymentMethods);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<PaymentMethodItem | null>(null);
  const [isSavingPayment, setIsSavingPayment] = React.useState(false);

  // Modal Form State
  const [formType, setFormType] = React.useState("BANK_TRANSFER");
  const [formName, setFormName] = React.useState("");
  const [formAccountNumber, setFormAccountNumber] = React.useState("");
  const [formAccountName, setFormAccountName] = React.useState("");
  const [formQrisImageUrl, setFormQrisImageUrl] = React.useState("");
  const [formInstructions, setFormInstructions] = React.useState("");
  const [formDisplayOrder, setFormDisplayOrder] = React.useState(0);
  const [formIsActive, setFormIsActive] = React.useState(true);

  // Handle Add Top-Up Amount
  const handleAddAmount = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(newAmountInput.replace(/\D/g, ""), 10);
    if (!parsed || parsed <= 0) {
      toast.error("Masukkan nominal yang valid (angka positif).");
      return;
    }
    if (topupAmounts.includes(parsed)) {
      toast.error("Nominal ini sudah ada di dalam daftar.");
      return;
    }
    const updated = [...topupAmounts, parsed].sort((a, b) => a - b);
    setTopupAmounts(updated);
    setNewAmountInput("");
  };

  const handleRemoveAmount = (amountToRemove: number) => {
    if (topupAmounts.length <= 1) {
      toast.error("Minimal harus menyisakan 1 opsi nominal top-up.");
      return;
    }
    setTopupAmounts(topupAmounts.filter((a) => a !== amountToRemove));
  };

  // Save Bot CMS Config
  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const cleanUsername = adminUsername.replace(/^@/, "").trim();
      const res = await updateTelegramBotConfigAction({
        ticketTemplate,
        importantNotes,
        nextStepsNotes,
        adminTelegramUsername: cleanUsername,
        topupAmounts,
      });

      if (res.ok) {
        toast.success("Konfigurasi Bot Telegram berhasil disimpan.");
        router.refresh();
      } else {
        toast.error("Gagal menyimpan konfigurasi bot.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan.";
      toast.error(msg);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormType("BANK_TRANSFER");
    setFormName("");
    setFormAccountNumber("");
    setFormAccountName("");
    setFormQrisImageUrl("");
    setFormInstructions("");
    setFormDisplayOrder((paymentMethods.length + 1) * 10);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: PaymentMethodItem) => {
    setEditingItem(item);
    setFormType(item.type);
    setFormName(item.name);
    setFormAccountNumber(item.accountNumber);
    setFormAccountName(item.accountName);
    setFormQrisImageUrl(item.qrisImageUrl || "");
    setFormInstructions(item.instructions || "");
    setFormDisplayOrder(item.displayOrder);
    setFormIsActive(item.isActive);
    setIsModalOpen(true);
  };

  // Save Payment Method (Create / Update)
  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Nama metode pembayaran wajib diisi.");
      return;
    }

    setIsSavingPayment(true);
    try {
      if (editingItem) {
        // Update
        const res = await updatePaymentMethodAction(editingItem.id, {
          type: formType,
          name: formName.trim(),
          accountNumber: formAccountNumber.trim(),
          accountName: formAccountName.trim(),
          qrisImageUrl: formQrisImageUrl.trim() || null,
          instructions: formInstructions.trim() || null,
          displayOrder: Number(formDisplayOrder) || 0,
          isActive: formIsActive,
        });

        if (res.ok) {
          toast.success("Metode pembayaran berhasil diperbarui.");
          setPaymentMethods((prev) =>
            prev
              .map((item) =>
                item.id === editingItem.id
                  ? {
                      ...item,
                      type: formType,
                      name: formName.trim(),
                      accountNumber: formAccountNumber.trim(),
                      accountName: formAccountName.trim(),
                      qrisImageUrl: formQrisImageUrl.trim() || null,
                      instructions: formInstructions.trim() || null,
                      displayOrder: Number(formDisplayOrder) || 0,
                      isActive: formIsActive,
                    }
                  : item
              )
              .sort((a, b) => a.displayOrder - b.displayOrder)
          );
          setIsModalOpen(false);
          router.refresh();
        }
      } else {
        // Create
        const res = await createPaymentMethodAction({
          type: formType,
          name: formName.trim(),
          accountNumber: formAccountNumber.trim(),
          accountName: formAccountName.trim(),
          qrisImageUrl: formQrisImageUrl.trim() || null,
          instructions: formInstructions.trim() || null,
          displayOrder: Number(formDisplayOrder) || 0,
          isActive: formIsActive,
        });

        if (res.ok && res.id) {
          toast.success("Metode pembayaran berhasil ditambahkan.");
          const newItem: PaymentMethodItem = {
            id: res.id,
            type: formType,
            name: formName.trim(),
            accountNumber: formAccountNumber.trim(),
            accountName: formAccountName.trim(),
            qrisImageUrl: formQrisImageUrl.trim() || null,
            instructions: formInstructions.trim() || null,
            displayOrder: Number(formDisplayOrder) || 0,
            isActive: formIsActive,
          };
          setPaymentMethods((prev) => [...prev, newItem].sort((a, b) => a.displayOrder - b.displayOrder));
          setIsModalOpen(false);
          router.refresh();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan metode pembayaran.";
      toast.error(msg);
    } finally {
      setIsSavingPayment(false);
    }
  };

  // Toggle Active Switch
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setPaymentMethods((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive: nextStatus } : item))
    );

    try {
      const res = await togglePaymentMethodAction(id, nextStatus);
      if (res.ok) {
        toast.success(`Metode pembayaran ${nextStatus ? "diaktifkan" : "dinonaktifkan"}.`);
        router.refresh();
      } else {
        throw new Error("Gagal mengubah status.");
      }
    } catch (err: unknown) {
      // Revert optimistic update
      setPaymentMethods((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isActive: currentStatus } : item))
      );
      const msg = err instanceof Error ? err.message : "Gagal memperbarui status.";
      toast.error(msg);
    }
  };

  // Delete Payment Method
  const handleDeletePayment = async (id: string, name: string) => {
    if (!confirm(`Hapus metode pembayaran "${name}"?`)) return;

    try {
      const res = await deletePaymentMethodAction(id);
      if (res.ok) {
        toast.success(`Metode pembayaran "${name}" berhasil dihapus.`);
        setPaymentMethods((prev) => prev.filter((item) => item.id !== id));
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus metode pembayaran.";
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Bot className="size-6 text-blue-600" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pengaturan Bot Telegram & Pembayaran
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Kelola markup teks bot Telegram, tautan konfirmasi admin, tombol nominal top-up, serta metode pembayaran dinamis.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bot-cms" className="space-y-6">
        <TabsList className="bg-slate-200/60 p-1">
          <TabsTrigger value="bot-cms" className="flex items-center gap-2 text-sm">
            <Bot className="size-4" />
            <span>Template Pesan Bot</span>
          </TabsTrigger>
          <TabsTrigger value="payment-methods" className="flex items-center gap-2 text-sm">
            <CreditCard className="size-4" />
            <span>Metode Pembayaran ({paymentMethods.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* TAB 1: BOT CMS & TEXT TEMPLATES                                */}
        {/* ============================================================== */}
        <TabsContent value="bot-cms" className="space-y-6 outline-none">
          {/* Admin Telegram Username & Top-Up Buttons Config */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Admin Telegram Username */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-800">
                  Username Kontak Admin Telegram
                </CardTitle>
                <CardDescription className="text-xs">
                  Target deep link tombol &quot;💬 Konfirmasi ke Admin&quot; pada tiket top-up pengguna.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 font-mono text-sm font-medium text-slate-400">
                      @
                    </span>
                    <Input
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="aldera_admin"
                      className="pl-7 font-mono text-sm"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://t.me/${adminUsername.replace(/^@/, "")}`, "_blank")}
                    disabled={!adminUsername.trim()}
                    className="shrink-0 gap-1.5 text-xs"
                  >
                    <ExternalLink className="size-3.5" />
                    Buka Chat
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Format tautan: <code className="text-blue-600">https://t.me/{adminUsername.replace(/^@/, "") || "username"}</code>
                </p>
              </CardContent>
            </Card>

            {/* Dynamic Top-Up Nominal Buttons */}
            <Card className="border-slate-200 bg-white shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-800">
                  Nominal Tombol Top-Up Saldo
                </CardTitle>
                <CardDescription className="text-xs">
                  Opsi pilihan nominal instan pada keyboard Telegram bot.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Current Nominals */}
                <div className="flex flex-wrap gap-2">
                  {topupAmounts.map((amt) => (
                    <Badge
                      key={amt}
                      variant="secondary"
                      className="gap-1.5 py-1 pl-2.5 pr-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition"
                    >
                      <span>Rp {amt.toLocaleString("id-ID")}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAmount(amt)}
                        className="rounded-full p-0.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600 transition"
                        title="Hapus nominal"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>

                {/* Add new nominal form */}
                <form onSubmit={handleAddAmount} className="flex gap-2 pt-1">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-medium text-slate-400">
                      Rp
                    </span>
                    <Input
                      type="number"
                      value={newAmountInput}
                      onChange={(e) => setNewAmountInput(e.target.value)}
                      placeholder="Contoh: 150000"
                      className="pl-8 text-xs font-mono"
                    />
                  </div>
                  <Button type="submit" size="sm" variant="secondary" className="gap-1 text-xs">
                    <Plus className="size-3.5" />
                    Tambah
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Template Rich Editor */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Hash className="size-4 text-blue-600" />
                Template Kartu Tiket Top-Up
              </CardTitle>
              <CardDescription className="text-xs">
                Format pesan utama saat tiket top-up baru dibuat oleh pengguna di Telegram.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TelegramTipTapEditor
                value={ticketTemplate}
                onChange={setTicketTemplate}
                adminUsername={adminUsername}
                previewTitle="Pratinjau Pesan Tiket Top-Up"
                minHeight="140px"
              />
            </CardContent>
          </Card>

          {/* Important Notes Rich Editor */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <HelpCircle className="size-4 text-amber-500" />
                Catatan Peringatan (&quot;⚠️ PENTING&quot;)
              </CardTitle>
              <CardDescription className="text-xs">
                Peringatan mengenai transfer sesuai 3 digit kode unik agar verifikasi manual berjalan lancar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TelegramTipTapEditor
                value={importantNotes}
                onChange={setImportantNotes}
                adminUsername={adminUsername}
                previewTitle="Pratinjau Catatan PENTING"
                minHeight="100px"
              />
            </CardContent>
          </Card>

          {/* Next Steps Notes Rich Editor */}
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Check className="size-4 text-emerald-600" />
                Instruksi Selanjutnya (&quot;📸 LANGKAH SELANJUTNYA&quot;)
              </CardTitle>
              <CardDescription className="text-xs">
                Panduan untuk pengguna mengirimkan foto bukti transfer (struk pembayaran) langsung ke bot.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TelegramTipTapEditor
                value={nextStepsNotes}
                onChange={setNextStepsNotes}
                adminUsername={adminUsername}
                previewTitle="Pratinjau Langkah Selanjutnya"
                minHeight="100px"
              />
            </CardContent>
          </Card>

          {/* Save Action Bar */}
          <div className="flex items-center justify-end pt-2">
            <Button
              onClick={handleSaveConfig}
              disabled={isSavingConfig}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              {isSavingConfig ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Menyimpan Perubahan…
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Simpan Konfigurasi Bot
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 2: DYNAMIC PAYMENT METHODS                                 */}
        {/* ============================================================== */}
        <TabsContent value="payment-methods" className="space-y-6 outline-none">
          <Card className="border-slate-200 bg-white shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-base font-semibold text-slate-800">
                  Daftar Metode Pembayaran Aktif
                </CardTitle>
                <CardDescription className="text-xs">
                  Rekening bank dan QRIS yang disajikan secara dinamis kepada pengguna saat top-up.
                </CardDescription>
              </div>
              <Button
                onClick={handleOpenAddModal}
                size="sm"
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="size-4" />
                Tambah Rekening / QRIS
              </Button>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
                  <CreditCard className="mx-auto size-10 text-slate-400" />
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Belum ada metode pembayaran yang terdaftar
                  </p>
                  <p className="text-xs text-slate-500">
                    Tambahkan rekening Bank atau QRIS agar pengguna dapat melakukan top-up saldo.
                  </p>
                  <Button
                    onClick={handleOpenAddModal}
                    size="sm"
                    variant="outline"
                    className="mt-4 gap-1.5 text-xs"
                  >
                    <Plus className="size-3.5" />
                    Tambah Metode Pertama
                  </Button>
                </div>
              ) : (
                <div className="overflow-hidden rounded-md border border-slate-200">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-[100px]">Tipe</TableHead>
                        <TableHead>Nama / Provider</TableHead>
                        <TableHead>No. Rekening / NMID</TableHead>
                        <TableHead>Atas Nama</TableHead>
                        <TableHead className="w-[80px] text-center">Urutan</TableHead>
                        <TableHead className="w-[110px] text-center">Status</TableHead>
                        <TableHead className="w-[120px] text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentMethods.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50/70">
                          {/* Type */}
                          <TableCell>
                            {item.type === "QRIS" ? (
                              <Badge variant="outline" className="gap-1 border-purple-200 bg-purple-50 text-purple-700">
                                <QrCode className="size-3" />
                                QRIS
                              </Badge>
                            ) : item.type === "EWALLET" ? (
                              <Badge variant="outline" className="gap-1 border-teal-200 bg-teal-50 text-teal-700">
                                <Wallet className="size-3" />
                                e-Wallet
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1 border-blue-200 bg-blue-50 text-blue-700">
                                <Building className="size-3" />
                                Bank
                              </Badge>
                            )}
                          </TableCell>

                          {/* Name */}
                          <TableCell className="font-medium text-slate-900">
                            {item.name}
                          </TableCell>

                          {/* Account Number */}
                          <TableCell className="font-mono text-xs">
                            {item.accountNumber ? (
                              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-800">
                                {item.accountNumber}
                              </code>
                            ) : (
                              <span className="text-slate-400 italic">QR Scan Only</span>
                            )}
                          </TableCell>

                          {/* Account Name */}
                          <TableCell className="text-xs text-slate-600">
                            {item.accountName || "-"}
                          </TableCell>

                          {/* Display Order */}
                          <TableCell className="text-center font-mono text-xs">
                            {item.displayOrder}
                          </TableCell>

                          {/* Status Switch */}
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Switch
                                checked={item.isActive}
                                onCheckedChange={() => handleToggleActive(item.id, item.isActive)}
                                aria-label="Toggle active status"
                              />
                              <span className="text-[11px] text-slate-500">
                                {item.isActive ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEditModal(item)}
                                className="size-8 text-slate-600 hover:text-slate-900"
                                title="Edit"
                              >
                                <Edit2 className="size-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePayment(item.id, item.name)}
                                className="size-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                                title="Hapus"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ================================================================ */}
      {/* ADD / EDIT PAYMENT METHOD MODAL DIALOG                           */}
      {/* ================================================================ */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Konfigurasikan detail rekening atau QRIS yang akan ditampilkan kepada pengguna saat top-up.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePaymentMethod} className="space-y-4 pt-2">
            {/* Tipe Pembayaran */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tipe Pembayaran</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "BANK_TRANSFER", label: "Bank Transfer", icon: Building },
                  { value: "QRIS", label: "QRIS Statis", icon: QrCode },
                  { value: "EWALLET", label: "E-Wallet", icon: Wallet },
                ].map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormType(opt.value)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-md border p-2 text-xs font-medium transition ${
                        formType === opt.value
                          ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="size-4" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nama Bank / Provider */}
            <div className="space-y-1.5">
              <Label htmlFor="form-name" className="text-xs font-semibold">
                Nama Bank / Provider <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="form-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Contoh: BCA, Mandiri, atau QRIS Aldera"
                className="text-xs"
                required
              />
            </div>

            {/* Nomor Rekening / NMID */}
            <div className="space-y-1.5">
              <Label htmlFor="form-account-no" className="text-xs font-semibold">
                Nomor Rekening / NMID
              </Label>
              <Input
                id="form-account-no"
                value={formAccountNumber}
                onChange={(e) => setFormAccountNumber(e.target.value)}
                placeholder="Contoh: 8830123456"
                className="font-mono text-xs"
              />
            </div>

            {/* Atas Nama */}
            <div className="space-y-1.5">
              <Label htmlFor="form-account-name" className="text-xs font-semibold">
                Atas Nama Pemilik Rekening
              </Label>
              <Input
                id="form-account-name"
                value={formAccountName}
                onChange={(e) => setFormAccountName(e.target.value)}
                placeholder="Contoh: PT Aldera Solusi Teknologi"
                className="text-xs"
              />
            </div>

            {/* URL Gambar QRIS */}
            <div className="space-y-1.5">
              <Label htmlFor="form-qris-url" className="text-xs font-semibold">
                URL Gambar QRIS (Opsional)
              </Label>
              <Input
                id="form-qris-url"
                value={formQrisImageUrl}
                onChange={(e) => setFormQrisImageUrl(e.target.value)}
                placeholder="https://assets.aldera.tech/qris/aldera-static.png"
                className="text-xs font-mono"
              />
            </div>

            {/* Petunjuk Tambahan */}
            <div className="space-y-1.5">
              <Label htmlFor="form-instructions" className="text-xs font-semibold">
                Petunjuk Transfer (Opsional)
              </Label>
              <Textarea
                id="form-instructions"
                value={formInstructions}
                onChange={(e) => setFormInstructions(e.target.value)}
                placeholder="Contoh: Transfer melalui m-BCA, ATM, atau scan QRIS."
                className="text-xs"
                rows={2}
              />
            </div>

            {/* Urutan & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="form-display-order" className="text-xs font-semibold">
                  Urutan Tampilan
                </Label>
                <Input
                  id="form-display-order"
                  type="number"
                  value={formDisplayOrder}
                  onChange={(e) => setFormDisplayOrder(parseInt(e.target.value, 10) || 0)}
                  className="font-mono text-xs"
                />
              </div>

              <div className="flex flex-col justify-end space-y-1.5 pb-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="form-is-active"
                    checked={formIsActive}
                    onCheckedChange={setFormIsActive}
                  />
                  <Label htmlFor="form-is-active" className="text-xs font-medium cursor-pointer">
                    Aktifkan Sekarang
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={isSavingPayment}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSavingPayment}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSavingPayment ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    Menyimpan…
                  </>
                ) : (
                  <>
                    <Check className="size-3.5" />
                    {editingItem ? "Perbarui" : "Simpan"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TelegramBotAdminClientView;
