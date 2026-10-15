"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Code2,
  Copy,
  CreditCard,
  KeyRound,
  Layers,
  Search,
  Sliders,
  Sparkles,
  Terminal,
  TrendingDown,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AUTH_ROUTES } from "@/lib/routes";
import {
  filterModelCatalog,
  generateIdePresetConfig,
  calculateMonthlyCost,
  type IdeTarget,
  type ModelCatalogItem,
  type ModelCategory,
} from "@/lib/ai-relay-utils";
import { formatCurrency } from "@/lib/utils";

interface AiRelayPublicClientViewProps {
  initialCatalog: ModelCatalogItem[];
}

const CATEGORY_TABS: { label: string; value: ModelCategory }[] = [
  { label: "Semua", value: "All" },
  { label: "Coding", value: "Coding" },
  { label: "Reasoning", value: "Reasoning" },
  { label: "Vision", value: "Vision" },
  { label: "Fast", value: "Fast" },
  { label: "Budget", value: "Budget" },
];

const IDE_TARGETS: { id: IdeTarget; name: string; tag: string }[] = [
  { id: "cursor", name: "Cursor IDE", tag: ".cursorrules / settings" },
  { id: "cline", name: "Cline (VS Code)", tag: "cline_mcp_settings.json" },
  { id: "roo", name: "Roo Code", tag: "Roo Clinic / Mode Config" },
  { id: "continue", name: "Continue.dev", tag: "config.json" },
  { id: "openwebui", name: "OpenWebUI", tag: "Docker / Web Env" },
];

export function AiRelayPublicClientView({
  initialCatalog,
}: AiRelayPublicClientViewProps) {
  // Model Catalog State
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active models only
  const activeModels = filterModelCatalog(initialCatalog, {
    category: selectedCategory,
    search: searchQuery,
    activeOnly: true,
  });

  // Quickstart IDE Preset State
  const [selectedIde, setSelectedIde] = useState<IdeTarget>("cursor");
  const [quickstartModelId, setQuickstartModelId] = useState<string>(
    initialCatalog.find((m) => m.isActive)?.id || "claude-3-5-sonnet-20241022"
  );
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);

  // Simulator State
  const [simModelAId, setSimModelAId] = useState<string>(
    initialCatalog.find((m) => m.id === "claude-3-5-sonnet-20241022")?.id ||
      initialCatalog[0]?.id ||
      ""
  );
  const [simModelBId, setSimModelBId] = useState<string>(
    initialCatalog.find((m) => m.id === "deepseek-chat")?.id ||
      initialCatalog[1]?.id ||
      ""
  );
  const [dailyRequests, setDailyRequests] = useState<number>(100);
  const [avgPromptTokens, setAvgPromptTokens] = useState<number>(2000);
  const [avgCompletionTokens, setAvgCompletionTokens] = useState<number>(500);

  const modelA = initialCatalog.find((m) => m.id === simModelAId);
  const modelB = initialCatalog.find((m) => m.id === simModelBId);

  const costA = modelA
    ? calculateMonthlyCost(
        dailyRequests,
        avgPromptTokens,
        avgCompletionTokens,
        modelA.inputPricePerM,
        modelA.outputPricePerM
      )
    : 0;

  const costB = modelB
    ? calculateMonthlyCost(
        dailyRequests,
        avgPromptTokens,
        avgCompletionTokens,
        modelB.inputPricePerM,
        modelB.outputPricePerM
      )
    : 0;

  const costDiff = Math.abs(costA - costB);
  const higherModel = costA >= costB ? modelA?.displayName : modelB?.displayName;
  const lowerModel = costA >= costB ? modelB?.displayName : modelA?.displayName;
  const higherCost = Math.max(costA, costB);
  const savingsPercent =
    higherCost > 0 ? Math.round((costDiff / higherCost) * 100) : 0;

  const handleCopyModelId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      toast.success(`Model ID '${id}' berhasil disalin!`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Gagal menyalin Model ID");
    }
  };

  const handleSelectModelForQuickstart = (modelId: string) => {
    setQuickstartModelId(modelId);
    const element = document.getElementById("quickstart-guide");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const generatedIdeConfig = generateIdePresetConfig(selectedIde, {
    apiKey: "sk-toko-YOUR_API_KEY",
    baseUrl: "https://aldera.tech/api/relay",
    modelId: quickstartModelId,
  });

  const handleCopyConfig = async () => {
    try {
      await navigator.clipboard.writeText(generatedIdeConfig);
      setCopiedConfig(true);
      toast.success(`Konfigurasi ${selectedIde.toUpperCase()} berhasil disalin!`);
      setTimeout(() => setCopiedConfig(false), 2000);
    } catch {
      toast.error("Gagal menyalin snippet konfigurasi");
    }
  };

  const getCategoryBadgeClass = (category: ModelCategory) => {
    switch (category) {
      case "Coding":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Reasoning":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Vision":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Fast":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Budget":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="flex flex-col">
      {/* =====================================================================
          1. HERO SECTION
          ===================================================================== */}
      <section className="relative overflow-hidden border-b border-black/10 bg-gradient-to-b from-[#f8f6f0] via-[#f4f2ea] to-[#eeece3] py-16 sm:py-24">
        <div className="public-container-px mx-auto max-w-screen-xxxl">
          <div className="mx-auto max-w-4xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0b6bff]/30 bg-[#0b6bff]/10 px-4 py-1.5 text-xs font-semibold text-[#0b6bff]">
              <Sparkles className="size-3.5" />
              <span>Gateway LLM Mandiri Pertama di Indonesia</span>
            </div>

            <h1 className="editorial-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#08090d]">
              Akses Model AI Dunia dengan Pembayaran Rupiah &amp; QRIS Lokal
            </h1>

            <p className="mx-auto max-w-2xl text-base sm:text-lg text-black/70 leading-relaxed">
              Satu API Key terpadu untuk Claude 3.5 Sonnet, GPT-4o, DeepSeek V3,
              dan Gemini. Tanpa perlu kartu kredit luar negeri, bayar instan pakai
              Rupiah &amp; QRIS dengan transparansi biaya per token.
            </p>

            {/* Main Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto h-12 px-8 bg-[#0b6bff] text-white hover:bg-[#075bd8] font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Link href={AUTH_ROUTES.register}>
                  Mulai Sekarang — Daftar Gratis
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-8 border-black/20 text-[#08090d] hover:bg-black/5 font-semibold"
              >
                <Link href={AUTH_ROUTES.login}>Masuk ke Portal</Link>
              </Button>
            </div>

            {/* Core Value Proposition Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-10 text-left">
              <div className="rounded-xl border border-black/10 bg-white/70 backdrop-blur-xs p-5 shadow-2xs">
                <div className="rounded-lg bg-indigo-50 text-indigo-600 p-2.5 w-fit mb-3">
                  <KeyRound className="size-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  1 Token API untuk Semua Model
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Akses Multi-Model Global: Claude, OpenAI, DeepSeek, Google
                  Gemini melalui satu endpoint kompatibel OpenAI.
                </p>
              </div>

              <div className="rounded-xl border border-black/10 bg-white/70 backdrop-blur-xs p-5 shadow-2xs">
                <div className="rounded-lg bg-emerald-50 text-emerald-600 p-2.5 w-fit mb-3">
                  <CreditCard className="size-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Pembayaran Rupiah &amp; QRIS instan
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pembayaran Rupiah &amp; QRIS Lokal tanpa Kartu Kredit. Saldo
                  otomatis masuk tanpa konversi valas atau biaya administrasi
                  tersembunyi.
                </p>
              </div>

              <div className="rounded-xl border border-black/10 bg-white/70 backdrop-blur-xs p-5 shadow-2xs">
                <div className="rounded-lg bg-blue-50 text-blue-600 p-2.5 w-fit mb-3">
                  <Terminal className="size-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Kompatibel dengan IDE favorit Anda
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kompatibel 1-Klik dengan IDE Cursor, Cline, dan Continue,
                  serta Roo Code dan OpenWebUI.
                </p>
              </div>

              <div className="rounded-xl border border-black/10 bg-white/70 backdrop-blur-xs p-5 shadow-2xs">
                <div className="rounded-lg bg-amber-50 text-amber-600 p-2.5 w-fit mb-3">
                  <Zap className="size-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Kecepatan tinggi dengan upstream relay aggregator
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Arsitektur high-throughput dengan koneksi langsung ke upstream
                  9router cluster, latensi rendah, dan token streaming responsif.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. TRANSPARENT MODEL CATALOG & PRICING TABLE
          ===================================================================== */}
      <section
        id="catalog-section"
        className="py-16 sm:py-24 bg-white border-b border-black/10"
      >
        <div className="public-container-px mx-auto max-w-screen-xxxl space-y-8">
          <div className="max-w-3xl space-y-3">
            <Badge
              variant="outline"
              className="text-xs font-semibold text-indigo-700 border-indigo-200 bg-indigo-50/50"
            >
              Transparansi Penuh
            </Badge>
            <h2 className="editorial-display text-3xl sm:text-4xl font-bold text-slate-950">
              Katalog Model &amp; Harga IDR per 1M Token
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Semua harga dihitung dalam Rupiah secara transparan per 1 juta
              token. Tidak ada langganan bulanan minimum — saldo Anda hanya
              terpotong sesuai pemakaian riil.
            </p>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
            <div className="flex flex-wrap gap-2">
              {CATEGORY_TABS.map((tab) => {
                const isSelected = selectedCategory === tab.value;
                return (
                  <Button
                    key={tab.value}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(tab.value)}
                    className={`rounded-full text-xs font-medium h-8 px-4 transition-all ${
                      isSelected
                        ? "bg-[#08090d] text-white hover:bg-black"
                        : "border-black/15 text-slate-700 hover:bg-black/5"
                    }`}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari model, ID, atau kegunaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9 bg-slate-50 border-black/15 focus:bg-white"
              />
            </div>
          </div>

          {/* Catalog Table */}
          {activeModels.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center space-y-2">
              <Layers className="size-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-semibold text-slate-800">
                Tidak ada model yang cocok
              </h4>
              <p className="text-xs text-muted-foreground">
                Coba sesuaikan kata kunci pencarian atau ganti filter kategori.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xs">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="font-bold text-slate-900 py-3.5 text-xs">
                      Model &amp; Kategori
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 py-3.5 text-xs">
                      Model ID (Tap to Copy)
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 py-3.5 text-xs">
                      Context Window
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 py-3.5 text-xs">
                      Harga Input / 1M
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 py-3.5 text-xs">
                      Harga Output / 1M
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 py-3.5 text-xs">
                      Rekomendasi Kegunaan
                    </TableHead>
                    <TableHead className="font-bold text-slate-900 py-3.5 text-xs text-right">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeModels.map((model) => (
                    <TableRow
                      key={model.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <TableCell className="py-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{model.displayName}</span>
                          <Badge
                            variant="secondary"
                            className={`text-[10px] font-medium ${getCategoryBadgeClass(
                              model.category
                            )}`}
                          >
                            {model.category}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5">
                          <code className="text-xs font-mono font-semibold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200">
                            {model.id}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyModelId(model.id)}
                            className="size-7 text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                            title="Salin Model ID"
                          >
                            {copiedId === model.id ? (
                              <Check className="size-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 text-xs font-mono text-slate-700">
                        {model.contextWindow.toLocaleString("id-ID")} token
                      </TableCell>
                      <TableCell className="py-4 text-xs font-mono font-semibold text-slate-900">
                        {formatCurrency(model.inputPricePerM)}
                      </TableCell>
                      <TableCell className="py-4 text-xs font-mono font-semibold text-slate-900">
                        {formatCurrency(model.outputPricePerM)}
                      </TableCell>
                      <TableCell className="py-4 text-xs text-slate-600 max-w-xs italic">
                        &ldquo;{model.bestFor}&rdquo;
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectModelForQuickstart(model.id)}
                          className="text-xs h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-1.5"
                        >
                          <Code2 className="size-3.5" />
                          Gunakan di IDE
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================================
          3. QUICKSTART DEVELOPER GUIDE
          ===================================================================== */}
      <section
        id="quickstart-guide"
        className="py-16 sm:py-24 bg-[#fbfaf6] border-b border-black/10"
      >
        <div className="public-container-px mx-auto max-w-screen-xxxl space-y-12">
          <div className="max-w-3xl space-y-3">
            <Badge
              variant="outline"
              className="text-xs font-semibold text-emerald-700 border-emerald-200 bg-emerald-50"
            >
              Integrasi Developer
            </Badge>
            <h2 className="editorial-display text-3xl sm:text-4xl font-bold text-slate-950">
              Panduan Cepat: 3 Langkah Mulai Coding
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Cukup tempel endpoint kami ke IDE favorit Anda. Format API 100%
              kompatibel dengan OpenAI spec, langsung siap pakai dalam 2 menit.
            </p>
          </div>

          {/* 3 Step Process Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-2xs space-y-3">
              <div className="size-9 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Buat Akun &amp; API Key
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Daftar akun gratis di portal Aldera Tech. Masuk ke dashboard AI
                Relay dan generate token API unik berformat{" "}
                <code className="text-[11px] font-mono bg-slate-100 px-1 py-0.5 rounded">
                  sk-toko-...
                </code>
                .
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-2xs space-y-3">
              <div className="size-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Top up Saldo via QRIS
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan kode QRIS instan dari m-banking atau e-wallet (GoPay, OVO,
                ShopeePay, Dana). Saldo masuk otomatis tanpa potongan biaya
                kartu kredit.
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-2xs space-y-3">
              <div className="size-9 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Konfigurasi IDE Anda
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pilih IDE di bawah ini, salin snippet JSON konfigurasi, lalu
                tempel ke pengaturan editor Anda untuk langsung mulai
                berinteraksi dengan AI.
              </p>
            </div>
          </div>

          {/* Interactive IDE Config Generator Preview */}
          <Card className="border border-black/10 bg-white shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                    <Terminal className="size-5 text-indigo-400" />
                    Snippet Konfigurasi IDE Siap Pakai
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-300 mt-1">
                    Pilih target tool dan model untuk menghasilkan format JSON yang
                    valid.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300">Model:</span>
                    <Select
                      value={quickstartModelId}
                      onValueChange={setQuickstartModelId}
                    >
                      <SelectTrigger className="h-8 text-xs bg-slate-800 border-slate-700 text-white w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {initialCatalog
                          .filter((m) => m.isActive)
                          .map((m) => (
                            <SelectItem
                              key={m.id}
                              value={m.id}
                              className="text-xs"
                            >
                              {m.displayName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleCopyConfig}
                    size="sm"
                    className="h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 shrink-0"
                  >
                    {copiedConfig ? (
                      <>
                        <Check className="size-3.5 text-emerald-400" />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        Salin Snippet
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* IDE Tabs */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800 mt-4">
                {IDE_TARGETS.map((ide) => {
                  const isSelected = selectedIde === ide.id;
                  return (
                    <button
                      key={ide.id}
                      type="button"
                      onClick={() => setSelectedIde(ide.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white font-semibold shadow-xs"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      {ide.name}
                    </button>
                  );
                })}
              </div>
            </CardHeader>

            <CardContent className="p-0 bg-slate-950">
              <pre className="p-6 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                <code>{generatedIdeConfig}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* =====================================================================
          4. COST COMPARISON & MONTHLY SIMULATION PREVIEW
          ===================================================================== */}
      <section className="py-16 sm:py-24 bg-white border-b border-black/10">
        <div className="public-container-px mx-auto max-w-screen-xxxl space-y-10">
          <div className="max-w-3xl space-y-3">
            <Badge
              variant="outline"
              className="text-xs font-semibold text-amber-700 border-amber-200 bg-amber-50"
            >
              Kalkulator Biaya
            </Badge>
            <h2 className="editorial-display text-3xl sm:text-4xl font-bold text-slate-950">
              Simulasi &amp; Perbandingan Pengeluaran AI Bulanan
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Bandingkan biaya antar model pilihan Anda berdasarkan perkiraan
              beban kerja harian untuk menemukan rasio performa dan efisiensi
              anggaran terbaik.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Sliders Input Panel */}
            <div className="lg:col-span-6 space-y-5 rounded-2xl border border-black/10 bg-slate-50/70 p-6 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="size-4 text-indigo-600" />
                Parameter Beban Kerja Harian
              </h3>

              {/* Slider 1: Requests per day */}
              <div className="space-y-2 rounded-xl bg-white p-4 border border-black/5 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">
                    Jumlah Request / Hari
                  </span>
                  <span className="font-mono font-bold text-indigo-600 text-sm">
                    {dailyRequests.toLocaleString("id-ID")} req
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="3000"
                  step="10"
                  value={dailyRequests}
                  onChange={(e) => setDailyRequests(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>10</span>
                  <span>1.500</span>
                  <span>3.000 req</span>
                </div>
              </div>

              {/* Slider 2: Prompt tokens */}
              <div className="space-y-2 rounded-xl bg-white p-4 border border-black/5 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">
                    Rata-rata Token Prompt
                  </span>
                  <span className="font-mono font-bold text-indigo-600 text-sm">
                    {avgPromptTokens.toLocaleString("id-ID")} tokens
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="8000"
                  step="100"
                  value={avgPromptTokens}
                  onChange={(e) => setAvgPromptTokens(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>200</span>
                  <span>4.000</span>
                  <span>8.000 tokens</span>
                </div>
              </div>

              {/* Slider 3: Completion tokens */}
              <div className="space-y-2 rounded-xl bg-white p-4 border border-black/5 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">
                    Rata-rata Token Completion
                  </span>
                  <span className="font-mono font-bold text-indigo-600 text-sm">
                    {avgCompletionTokens.toLocaleString("id-ID")} tokens
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="3000"
                  step="50"
                  value={avgCompletionTokens}
                  onChange={(e) => setAvgCompletionTokens(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>50</span>
                  <span>1.500</span>
                  <span>3.000 tokens</span>
                </div>
              </div>
            </div>

            {/* Results Side-by-Side Panel */}
            <div className="lg:col-span-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Model A */}
                <div className="rounded-2xl border border-black/10 bg-white p-5 space-y-3 shadow-2xs">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">
                      Model Pilihan A
                    </Label>
                    <Select value={simModelAId} onValueChange={setSimModelAId}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {initialCatalog
                          .filter((m) => m.isActive)
                          .map((m) => (
                            <SelectItem
                              key={m.id}
                              value={m.id}
                              className="text-xs"
                            >
                              {m.displayName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Estimasi Biaya / Bulan
                    </span>
                    <div className="text-2xl font-extrabold font-mono text-slate-900">
                      {formatCurrency(costA)}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Untuk {dailyRequests * 30} panggilan per bulan
                    </p>
                  </div>
                </div>

                {/* Model B */}
                <div className="rounded-2xl border border-black/10 bg-white p-5 space-y-3 shadow-2xs">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">
                      Model Pilihan B
                    </Label>
                    <Select value={simModelBId} onValueChange={setSimModelBId}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {initialCatalog
                          .filter((m) => m.isActive)
                          .map((m) => (
                            <SelectItem
                              key={m.id}
                              value={m.id}
                              className="text-xs"
                            >
                              {m.displayName}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Estimasi Biaya / Bulan
                    </span>
                    <div className="text-2xl font-extrabold font-mono text-slate-900">
                      {formatCurrency(costB)}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Untuk {dailyRequests * 30} panggilan per bulan
                    </p>
                  </div>
                </div>
              </div>

              {/* Savings Banner */}
              {costDiff > 0 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 flex items-start gap-3.5 shadow-2xs">
                  <div className="rounded-full bg-emerald-600 text-white p-2 shrink-0 mt-0.5">
                    <TrendingDown className="size-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-emerald-950">
                      Penghematan Potensial: {formatCurrency(costDiff)} / bulan (
                      {savingsPercent}%)
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Memilih <strong>{lowerModel}</strong> dibanding{" "}
                      <strong>{higherModel}</strong> dapat menekan pengeluaran AI
                      hingga {savingsPercent}% untuk beban volume yang sama.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          5. BOTTOM CONVERSION CTA
          ===================================================================== */}
      <section className="editorial-ink py-16 sm:py-24">
        <div className="public-container-px mx-auto max-w-screen-xxxl">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 sm:p-14 text-center max-w-4xl mx-auto space-y-6">
            <Badge
              variant="outline"
              className="text-xs font-semibold text-[#0b6bff] border-[#0b6bff]/30 bg-[#0b6bff]/10 mx-auto"
            >
              Mulai Dalam Hitungan Menit
            </Badge>

            <h2 className="editorial-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Siap Mengakselerasi Workflow Coding &amp; AI Anda?
            </h2>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-white/70 leading-relaxed">
              Bergabunglah dengan pengembang dan tim software di Indonesia yang
              meninggalkan kerumitan kartu kredit luar negeri dan beralih ke
              Aldera AI Relay.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto h-12 px-8 bg-[#0b6bff] text-white hover:bg-[#075bd8] font-bold shadow-md"
              >
                <Link href={AUTH_ROUTES.register}>
                  Daftar Sekarang — Akses Instan
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto h-12 px-8 border-white/20 text-white hover:bg-white/10 font-semibold"
              >
                <Link href={AUTH_ROUTES.login}>Sudah Punya Akun? Masuk</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
