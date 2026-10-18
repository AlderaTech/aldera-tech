"use client";
import type { ReactNode } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  Send,
  SlidersHorizontal,
  Sparkles,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ModelCatalogItem } from "@/lib/ai-relay-utils";
import { useAiPlayground } from "./_hooks/use-ai-playground";
import { PlaygroundMessages } from "./_components/playground-messages";
import { PlaygroundTelemetry } from "./_components/playground-telemetry";

interface AiPlaygroundProps {
  emptyIllustration?: ReactNode;
  models: ModelCatalogItem[];
  userBalance: number;
  onBalanceChange?: (newBalance: number) => void;
}

export function AiPlayground({
  emptyIllustration,
  models,
  userBalance,
  onBalanceChange,
}: AiPlaygroundProps) {
  const {
    activeModels,
    selectedModel,
    setSelectedModel,
    systemPrompt,
    setSystemPrompt,
    showSystemPrompt,
    setShowSystemPrompt,
    prompt,
    setPrompt,
    isLoading,
    messages,
    lastUsage,
    lastDuration,
    currentBalance,
    currentModelMeta,
    handleSend,
    handleKeyDown,
    handleClearHistory,
  } = useAiPlayground({ models, userBalance, onBalanceChange });
  const InstructionIcon = emptyIllustration ? SlidersHorizontal : Sparkles;

  return (
    <div
      className="grid grid-cols-1 gap-6 lg:grid-cols-4"
      data-relay-playground
    >
      {/* Main Chatbed Area (3 cols) */}
      <Card
        data-relay-chat
        className="flex h-[700px] flex-col border shadow-xs lg:col-span-3"
      >
        {/* Playground Header */}
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b px-4 py-3">
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
              <SelectTrigger
                aria-label="Model Playground"
                className="h-8 w-[200px] text-xs font-medium"
              >
                <SelectValue placeholder="Pilih Model" />
              </SelectTrigger>
              <SelectContent>
                {activeModels.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-xs">
                    <span className="font-semibold">{m.displayName}</span>{" "}
                    <span className="font-mono text-[10px] text-slate-400">
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
                aria-label="Bersihkan percakapan"
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
            aria-expanded={showSystemPrompt}
            className="flex w-full items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <span className="flex items-center gap-1.5">
              <InstructionIcon className="h-3.5 w-3.5 text-indigo-500" />
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
                aria-label="Instruksi system prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Instruksi perilaku sistem AI..."
                rows={2}
                className="resize-none bg-white text-xs"
              />
            </div>
          )}
        </div>

        <PlaygroundMessages
          messages={messages}
          isLoading={isLoading}
          selectedModel={selectedModel}
          currentModelMeta={currentModelMeta}
          onSample={setPrompt}
          emptyIllustration={emptyIllustration}
        />

        {/* Input Bar */}
        <div className="border-t bg-white p-3">
          <div className="flex gap-2">
            <Textarea
              aria-label="Prompt untuk model AI"
              placeholder="Tulis prompt Anda di sini... (Tekan Enter untuk kirim, Shift+Enter untuk baris baru)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={2}
              className="min-h-[48px] resize-none text-xs"
            />
            <Button
              aria-label="Kirim prompt"
              onClick={handleSend}
              disabled={isLoading || !prompt.trim()}
              className="h-10 self-end bg-indigo-600 px-4 text-white hover:bg-indigo-700"
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

      <PlaygroundTelemetry
        currentModelMeta={currentModelMeta}
        lastUsage={lastUsage}
        lastDuration={lastDuration}
        currentBalance={currentBalance}
      />
    </div>
  );
}
