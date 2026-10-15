"use client";

import { useState } from "react";
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Coins,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  Terminal,
  User,
  Zap,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  executePlaygroundChat,
  type ModelCatalogItem,
  type PlaygroundChatResult,
} from "@/lib/actions/ai-relay";
import { formatCurrency } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokens?: {
    prompt: number;
    completion: number;
    cost: number;
    durationMs: number;
  };
}

interface AiPlaygroundProps {
  models: ModelCatalogItem[];
  userBalance: number;
  onBalanceChange?: (newBalance: number) => void;
}

const SAMPLE_PROMPTS = [
  "Buatkan contoh implementasi debounce search di React 19.",
  "Bagaimana cara mengoptimalkan SQL query dengan index di PostgreSQL?",
  "Tuliskan fungsi algoritma Dijkstra dalam TypeScript modern.",
  "Jelaskan perbedaan mendasar antara RAG dan fine-tuning LLM.",
];

export function AiPlayground({
  models,
  userBalance,
  onBalanceChange,
}: AiPlaygroundProps) {
  const activeModels = models.filter((m) => m.isActive);
  const defaultModel =
    activeModels.find((m) => m.id === "gpt-4o-mini")?.id ||
    activeModels[0]?.id ||
    "gpt-4o-mini";

  const [selectedModel, setSelectedModel] = useState<string>(defaultModel);
  const [systemPrompt, setSystemPrompt] = useState<string>(
    "Anda adalah asisten AI yang cerdas, efisien, dan ramah dari Aldera Tech."
  );
  const [showSystemPrompt, setShowSystemPrompt] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastUsage, setLastUsage] =
    useState<PlaygroundChatResult["usage"] | null>(null);
  const [lastDuration, setLastDuration] = useState<number | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(userBalance);

  const currentModelMeta = models.find((m) => m.id === selectedModel);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    if (currentBalance <= 0) {
      toast.error("Saldo Anda Rp 0. Silakan top-up terlebih dahulu di tab Saldo.");
      return;
    }

    const userMessageContent = prompt.trim();
    const userMsgId = String(Date.now());
    const newMessages: ChatMessage[] = [
      ...messages,
      { id: userMsgId, role: "user", content: userMessageContent },
    ];

    setMessages(newMessages);
    setPrompt("");
    setIsLoading(true);

    try {
      const res = await executePlaygroundChat({
        model: selectedModel,
        prompt: userMessageContent,
        systemPrompt: systemPrompt.trim() || undefined,
      });

      if (res.success) {
        const assistantMsg: ChatMessage = {
          id: String(Date.now() + 1),
          role: "assistant",
          content: res.content,
          tokens: {
            prompt: res.usage.promptTokens,
            completion: res.usage.completionTokens,
            cost: res.usage.totalCostIdr,
            durationMs: res.durationMs,
          },
        };
        setMessages([...newMessages, assistantMsg]);
        setLastUsage(res.usage);
        setLastDuration(res.durationMs);
        setCurrentBalance(res.newBalance);
        onBalanceChange?.(res.newBalance);
        toast.success(
          `Respons diterima! Biaya: ${formatCurrency(res.usage.totalCostIdr)}`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengeksekusi chat.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
    setLastUsage(null);
    setLastDuration(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Chatbed Area (3 cols) */}
      <Card className="lg:col-span-3 border shadow-xs flex flex-col h-[700px]">
        {/* Playground Header */}
        <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-600 p-2 text-white">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                AI Relay Playground
              </CardTitle>
              <CardDescription className="text-xs">
                Uji model dan prompt secara interaktif dengan penghitungan token
                real-time.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={selectedModel}
              onValueChange={setSelectedModel}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[200px] h-8 text-xs font-medium">
                <SelectValue placeholder="Pilih Model" />
              </SelectTrigger>
              <SelectContent>
                {activeModels.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-xs">
                    <span className="font-semibold">{m.displayName}</span>{" "}
                    <span className="text-slate-400 font-mono text-[10px]">
                      ({m.category})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearHistory}
                disabled={isLoading}
                className="h-8 w-8 text-slate-400 hover:text-slate-700"
                title="Bersihkan Percakapan"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Collapsible System Prompt */}
        <div className="border-b bg-slate-50/60 px-4 py-2">
          <button
            type="button"
            onClick={() => setShowSystemPrompt(!showSystemPrompt)}
            className="flex w-full items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              System Prompt Instruksi
            </span>
            {showSystemPrompt ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {showSystemPrompt && (
            <div className="mt-2">
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Instruksi perilaku sistem AI..."
                rows={2}
                className="text-xs bg-white resize-none"
              />
            </div>
          )}
        </div>

        {/* Chat History View */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="rounded-full bg-indigo-50 p-4 text-indigo-600 mb-3">
                <Bot className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">
                Mulai Uji Coba Prompt
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-6">
                Kirim prompt untuk mengevaluasi kecepatan respon, penalaran, dan
                biaya token per request dari model{" "}
                <strong>{currentModelMeta?.displayName}</strong>.
              </p>

              <div className="w-full max-w-md space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-left">
                  Contoh Prompt Cepat:
                </span>
                <div className="grid grid-cols-1 gap-1.5 text-left">
                  {SAMPLE_PROMPTS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(sample)}
                      className="rounded-lg border bg-white p-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:border-indigo-200 transition-colors text-left"
                    >
                      &ldquo;{sample}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-xs"
                      : "bg-slate-100 text-slate-900 border rounded-tl-xs whitespace-pre-wrap"
                  }`}
                >
                  <p>{msg.content}</p>
                  {msg.tokens && (
                    <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                      <span>In: {msg.tokens.prompt}</span>
                      <span>Out: {msg.tokens.completion}</span>
                      <span>Biaya: {formatCurrency(msg.tokens.cost)}</span>
                      <span>{msg.tokens.durationMs}ms</span>
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="h-7 w-7 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-xl bg-slate-100 p-3 text-xs border flex items-center gap-2 text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span>Memproses melalui relay {selectedModel}...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t bg-white">
          <div className="flex gap-2">
            <Textarea
              placeholder="Tulis prompt Anda di sini... (Tekan Enter untuk kirim, Shift+Enter untuk baris baru)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={2}
              className="resize-none text-xs min-h-[48px]"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !prompt.trim()}
              className="self-end bg-indigo-600 hover:bg-indigo-700 text-white h-10 px-4"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Live Cost & Telemetry Tracker (1 col) */}
      <div className="space-y-4">
        {/* Model Card */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Model Terpilih
            </CardTitle>
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-sm text-slate-900 truncate">
                {currentModelMeta?.displayName}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {currentModelMeta?.category}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-xs pt-1">
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-slate-500">Harga Input:</span>
              <span className="font-mono font-medium">
                {formatCurrency(currentModelMeta?.inputPricePerM || 0)} / 1M
              </span>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-slate-500">Harga Output:</span>
              <span className="font-mono font-medium">
                {formatCurrency(currentModelMeta?.outputPricePerM || 0)} / 1M
              </span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-slate-500">Konteks:</span>
              <span className="font-mono">
                {(currentModelMeta?.contextWindow || 0).toLocaleString("id-ID")}{" "}
                token
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Live Token & Cost Telemetry */}
        <Card className="border shadow-xs bg-slate-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              Telemetri Permintaan Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {lastUsage ? (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-600">Prompt Tokens:</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {lastUsage.promptTokens}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Completion Tokens:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {lastUsage.completionTokens}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Tokens:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {lastUsage.totalTokens}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-1.5">
                  <span className="text-slate-600">Durasi Response:</span>
                  <span className="font-mono">{lastDuration} ms</span>
                </div>
                <div className="flex justify-between border-t pt-2 items-baseline">
                  <span className="font-semibold text-slate-900">
                    Biaya Terdebit:
                  </span>
                  <span className="font-mono font-extrabold text-sm text-emerald-700">
                    {formatCurrency(lastUsage.totalCostIdr)}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-[11px] py-3 text-center">
                Belum ada request yang dieksekusi di sesi ini.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Current Balance Widget */}
        <Card className="border shadow-xs bg-indigo-50/40 border-indigo-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5 text-indigo-600" />
              Sisa Saldo Real-Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-indigo-950 font-mono">
              {formatCurrency(currentBalance)}
            </div>
            <p className="text-[10px] text-indigo-600/90 mt-1">
              Diproses secara atomik via trigger PostgreSQL.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
