import type { ReactNode } from "react";
import { Bot, Cpu, Loader2, User } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ModelCatalogItem } from "@/lib/ai-relay-utils";
import type { ChatMessage } from "../_types/playground";
const SAMPLE_PROMPTS = [
  "Buatkan contoh implementasi debounce search di React 19.",
  "Bagaimana cara mengoptimalkan SQL query dengan index di PostgreSQL?",
  "Tuliskan fungsi algoritma Dijkstra dalam TypeScript modern.",
  "Jelaskan perbedaan mendasar antara RAG dan fine-tuning LLM.",
];

export function PlaygroundMessages({
  messages,
  isLoading,
  selectedModel,
  currentModelMeta,
  onSample,
  emptyIllustration,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
  selectedModel: string;
  currentModelMeta?: ModelCatalogItem;
  onSample: (prompt: string) => void;
  emptyIllustration?: ReactNode;
}) {
  const AssistantIcon = emptyIllustration ? Cpu : Bot;
  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center px-4 text-center">
          {emptyIllustration || (
            <div className="mb-3 rounded-full bg-indigo-50 p-4 text-indigo-600">
              <Bot className="h-8 w-8" />
            </div>
          )}
          <h3 className="text-sm font-semibold text-slate-800">
            Mulai Uji Coba Prompt
          </h3>
          <p className="mt-1 mb-6 max-w-sm text-xs text-muted-foreground">
            Kirim prompt untuk mengevaluasi kecepatan respon, penalaran, dan
            biaya token per request dari model{" "}
            <strong>{currentModelMeta?.displayName}</strong>.
          </p>

          <div className="w-full max-w-md space-y-2">
            <span className="block text-left text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Contoh Prompt Cepat:
            </span>
            <div className="grid grid-cols-1 gap-1.5 text-left">
              {SAMPLE_PROMPTS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSample(sample)}
                  className="rounded-lg border bg-white p-2.5 text-left text-xs text-slate-700 transition-colors hover:border-indigo-200 hover:bg-slate-50"
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
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                <AssistantIcon className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "rounded-tr-xs bg-indigo-600 text-white"
                  : "rounded-tl-xs border bg-slate-100 whitespace-pre-wrap text-slate-900"
              }`}
            >
              <p>{msg.content}</p>
              {msg.tokens && (
                <div className="mt-2 flex items-center gap-3 border-t border-slate-200/80 pt-2 font-mono text-[10px] text-slate-500">
                  <span>In: {msg.tokens.prompt}</span>
                  <span>Out: {msg.tokens.completion}</span>
                  <span>Biaya: {formatCurrency(msg.tokens.cost)}</span>
                  <span>{msg.tokens.durationMs}ms</span>
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))
      )}

      {isLoading && (
        <div className="flex items-center justify-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-2 rounded-xl border bg-slate-100 p-3 text-xs text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            <span>Memproses melalui relay {selectedModel}...</span>
          </div>
        </div>
      )}
    </div>
  );
}
