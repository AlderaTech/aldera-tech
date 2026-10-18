"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  executePlaygroundChat,
  type ModelCatalogItem,
  type PlaygroundChatResult,
} from "@/lib/actions/ai-relay";
import { formatCurrency } from "@/lib/utils";
import type { ChatMessage } from "../_types/playground";
export function useAiPlayground({
  models,
  userBalance,
  onBalanceChange,
}: {
  models: ModelCatalogItem[];
  userBalance: number;
  onBalanceChange?: (balance: number) => void;
}) {
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
  const [lastUsage, setLastUsage] = useState<
    PlaygroundChatResult["usage"] | null
  >(null);
  const [lastDuration, setLastDuration] = useState<number | null>(null);
  const [currentBalance, setCurrentBalance] = useState<number>(userBalance);

  const currentModelMeta = models.find((m) => m.id === selectedModel);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    if (currentBalance <= 0) {
      toast.error(
        "Saldo Anda Rp 0. Silakan top-up terlebih dahulu di tab Saldo."
      );
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
      const msg =
        err instanceof Error ? err.message : "Gagal mengeksekusi chat.";
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

  return {
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
  };
}
