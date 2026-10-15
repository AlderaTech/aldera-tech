// ============================================================================
// Types & Interfaces
// ============================================================================

export type ModelCategory =
  | "Coding"
  | "Reasoning"
  | "Vision"
  | "Fast"
  | "Budget"
  | "All";

export interface ModelCatalogItem {
  id: string;
  displayName: string;
  category: ModelCategory;
  contextWindow: number;
  inputPricePerM: number; // in IDR
  outputPricePerM: number; // in IDR
  bestFor: string;
  isActive: boolean;
}

export interface ApiKeyRecord {
  id: number;
  user_id: number;
  key_prefix: string;
  label: string;
  is_active: boolean;
  total_spent: number;
  last_used_at: Date | null;
  created_at: Date;
}

export interface BalanceTransactionRecord {
  id: number;
  user_id: number;
  amount: number;
  transaction_type: "topup" | "usage" | "manual_adjust";
  balance_before: number;
  balance_after: number;
  reference_id: string | null;
  notes: string | null;
  created_at: Date;
}

export interface TopupRequestRecord {
  id: number;
  user_id: number;
  amount: number;
  unique_code: number;
  total_transfer: number;
  proof_file_id: string | null;
  status: "pending" | "approved" | "rejected";
  admin_id: number | null;
  created_at: Date;
  approved_at: Date | null;
}

export interface UsageLogRecord {
  id: number;
  user_id: number;
  api_key_id: number | null;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_cost: number;
  duration_ms: number;
  is_stream: boolean;
  created_at: Date;
}

export interface DailyUsageStat {
  date: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costIdr: number;
}

export interface UsageAnalyticsSummary {
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCostIdr: number;
  totalRequests: number;
  dailyStats: DailyUsageStat[];
  modelBreakdown: Record<
    string,
    { tokens: number; costIdr: number; requestCount: number }
  >;
}

export interface ModelHealthStatus {
  model: string;
  avgLatencyMs: number;
  tokensPerSec: number;
  errorRatePct: number;
  status: "operational" | "degraded" | "offline";
  totalRequests: number;
}

export type IdeTarget = "cursor" | "cline" | "roo" | "continue" | "openwebui";

export interface IdePresetConfigParams {
  apiKey: string;
  baseUrl: string;
  modelId: string;
}

export interface PlaygroundChatResult {
  success: boolean;
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    totalCostIdr: number;
  };
  durationMs: number;
  newBalance: number;
}

// ============================================================================
// Model Seed Metadata Map
// ============================================================================

export const MODEL_METADATA_MAP: Record<
  string,
  { category: ModelCategory; contextWindow: number; bestFor: string }
> = {
  "gpt-4o": {
    category: "Vision",
    contextWindow: 128000,
    bestFor: "Multimodal analysis, complex reasoning, general tasks",
  },
  "gpt-4o-mini": {
    category: "Fast",
    contextWindow: 128000,
    bestFor: "High-speed lightweight completions, cost-efficient chat",
  },
  "claude-3-5-sonnet-20241022": {
    category: "Coding",
    contextWindow: 200000,
    bestFor: "Advanced code generation, refactoring, architectural reasoning",
  },
  "claude-3-5-haiku-20241022": {
    category: "Fast",
    contextWindow: 200000,
    bestFor: "Rapid agent workflows, low-latency code review",
  },
  "deepseek-chat": {
    category: "Budget",
    contextWindow: 64000,
    bestFor: "Ultra-affordable reasoning and general intelligence",
  },
  "deepseek-reasoner": {
    category: "Reasoning",
    contextWindow: 64000,
    bestFor: "Complex mathematical proofs, step-by-step logic",
  },
};

export const DEFAULT_MODEL_CATALOG: ModelCatalogItem[] = [
  {
    id: "deepseek-chat",
    displayName: "DeepSeek V3",
    category: "Budget",
    contextWindow: 64000,
    inputPricePerM: 2200,
    outputPricePerM: 8800,
    bestFor: "Ultra-affordable reasoning and general intelligence",
    isActive: true,
  },
  {
    id: "gpt-4o-mini",
    displayName: "OpenAI GPT-4o Mini",
    category: "Fast",
    contextWindow: 128000,
    inputPricePerM: 2500,
    outputPricePerM: 10000,
    bestFor: "High-speed lightweight completions, cost-efficient chat",
    isActive: true,
  },
  {
    id: "deepseek-reasoner",
    displayName: "DeepSeek R1",
    category: "Reasoning",
    contextWindow: 64000,
    inputPricePerM: 8000,
    outputPricePerM: 32000,
    bestFor: "Complex mathematical proofs, step-by-step logic",
    isActive: true,
  },
  {
    id: "claude-3-5-haiku-20241022",
    displayName: "Claude 3.5 Haiku",
    category: "Fast",
    contextWindow: 200000,
    inputPricePerM: 16000,
    outputPricePerM: 80000,
    bestFor: "Rapid agent workflows, low-latency code review",
    isActive: true,
  },
  {
    id: "gpt-4o",
    displayName: "OpenAI GPT-4o",
    category: "Vision",
    contextWindow: 128000,
    inputPricePerM: 40000,
    outputPricePerM: 160000,
    bestFor: "Multimodal analysis, complex reasoning, general tasks",
    isActive: true,
  },
  {
    id: "claude-3-5-sonnet-20241022",
    displayName: "Claude 3.5 Sonnet",
    category: "Coding",
    contextWindow: 200000,
    inputPricePerM: 48000,
    outputPricePerM: 240000,
    bestFor: "Advanced code generation, refactoring, architectural reasoning",
    isActive: true,
  },
];

// ============================================================================
// Pure Calculation & Formatting Helpers (F4, F5, F6, F7, F8, F9, F10)
// ============================================================================

/**
 * Generates a 3-digit random unique verification code strictly within [100, 999].
 */
export function generateUniqueCode(): number {
  return Math.floor(100 + Math.random() * 900);
}

/**
 * Calculates total transfer nominal (nominal pokok + kode unik).
 */
export function calculateTotalTransfer(amount: number, uniqueCode: number): number {
  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }
  if (uniqueCode < 100 || uniqueCode > 999) {
    throw new Error("Unique code must be in range [100, 999]");
  }
  return amount + uniqueCode;
}

/**
 * Calculates token cost in IDR based on input and output pricing per 1M tokens.
 * Formula: ((prompt_tokens * input_price) + (completion_tokens * output_price)) / 1,000,000
 * Precise to 4 decimal places.
 */
export function calculateTokenCost(
  promptTokens: number,
  completionTokens: number,
  inputPricePerM: number,
  outputPricePerM: number
): number {
  if (promptTokens < 0 || completionTokens < 0) {
    throw new Error("Tokens cannot be negative");
  }
  const inputCost = (promptTokens * inputPricePerM) / 1_000_000;
  const outputCost = (completionTokens * outputPricePerM) / 1_000_000;
  return Number((inputCost + outputCost).toFixed(4));
}

/**
 * Aggregates usage logs into comprehensive analytics (totals, daily series, and per-model breakdown).
 */
export function aggregateUsageLogs(logs: UsageLogRecord[]): UsageAnalyticsSummary {
  let promptSum = 0;
  let compSum = 0;
  let costSum = 0;
  const dailyMap: Record<
    string,
    { promptTokens: number; completionTokens: number; totalTokens: number; costIdr: number }
  > = {};
  const breakdown: Record<
    string,
    { tokens: number; costIdr: number; requestCount: number }
  > = {};

  for (const log of logs) {
    promptSum += log.prompt_tokens;
    compSum += log.completion_tokens;
    costSum += log.total_cost;

    // Daily grouping
    const dateStr =
      log.created_at instanceof Date
        ? log.created_at.toISOString().split("T")[0]
        : new Date(log.created_at).toISOString().split("T")[0];

    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        costIdr: 0,
      };
    }
    dailyMap[dateStr].promptTokens += log.prompt_tokens;
    dailyMap[dateStr].completionTokens += log.completion_tokens;
    dailyMap[dateStr].totalTokens += log.prompt_tokens + log.completion_tokens;
    dailyMap[dateStr].costIdr += log.total_cost;

    // Model breakdown
    if (!breakdown[log.model]) {
      breakdown[log.model] = { tokens: 0, costIdr: 0, requestCount: 0 };
    }
    const totalLogTokens = log.prompt_tokens + log.completion_tokens;
    breakdown[log.model].tokens += totalLogTokens;
    breakdown[log.model].costIdr += log.total_cost;
    breakdown[log.model].requestCount += 1;
  }

  const dailyStats: DailyUsageStat[] = Object.keys(dailyMap)
    .sort()
    .map((date) => ({
      date,
      promptTokens: dailyMap[date].promptTokens,
      completionTokens: dailyMap[date].completionTokens,
      totalTokens: dailyMap[date].totalTokens,
      costIdr: Number(dailyMap[date].costIdr.toFixed(4)),
    }));

  return {
    totalPromptTokens: promptSum,
    totalCompletionTokens: compSum,
    totalTokens: promptSum + compSum,
    totalCostIdr: Number(costSum.toFixed(4)),
    totalRequests: logs.length,
    dailyStats,
    modelBreakdown: breakdown,
  };
}

/**
 * Calculates operational health metrics (latency, throughput, status) for a given model.
 */
export function calculateModelHealth(
  model: string,
  logs: UsageLogRecord[]
): ModelHealthStatus {
  const modelLogs = logs.filter((l) => l.model === model);
  if (modelLogs.length === 0) {
    return {
      model,
      avgLatencyMs: 0,
      tokensPerSec: 0,
      errorRatePct: 0,
      status: "operational",
      totalRequests: 0,
    };
  }

  const totalDuration = modelLogs.reduce((acc, l) => acc + l.duration_ms, 0);
  const totalCompletion = modelLogs.reduce(
    (acc, l) => acc + l.completion_tokens,
    0
  );
  const avgLatency = Math.round(totalDuration / modelLogs.length);
  const seconds = totalDuration / 1000;
  const tokensPerSec =
    seconds > 0 ? Number((totalCompletion / seconds).toFixed(1)) : 0;

  let status: "operational" | "degraded" | "offline" = "operational";
  if (avgLatency > 5000) {
    status = "degraded";
  }

  return {
    model,
    avgLatencyMs: avgLatency,
    tokensPerSec,
    errorRatePct: 0,
    status,
    totalRequests: modelLogs.length,
  };
}

/**
 * Calculates estimated monthly cost in IDR based on daily requests and token averages.
 */
export function calculateMonthlyCost(
  dailyRequests: number,
  avgPromptTokens: number,
  avgCompletionTokens: number,
  inputPricePerM: number,
  outputPricePerM: number
): number {
  if (dailyRequests < 0 || avgPromptTokens < 0 || avgCompletionTokens < 0) {
    throw new Error("Inputs cannot be negative");
  }
  const costPerRequest =
    (avgPromptTokens * inputPricePerM + avgCompletionTokens * outputPricePerM) /
    1_000_000;
  const monthlyCost = 30 * dailyRequests * costPerRequest;
  return Number(monthlyCost.toFixed(2));
}

/**
 * Generates verified JSON configuration snippets for popular developer IDEs / tools.
 */
export function generateIdePresetConfig(
  target: IdeTarget,
  params: IdePresetConfigParams
): string {
  const { apiKey, baseUrl, modelId } = params;
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");

  switch (target) {
    case "cursor":
      return JSON.stringify(
        {
          "openai-api-key": apiKey,
          "openai-base-url": `${cleanBaseUrl}/v1`,
          model: modelId,
        },
        null,
        2
      );
    case "cline":
      return JSON.stringify(
        {
          mcpServers: {},
          apiProvider: "openai",
          openAiBaseUrl: `${cleanBaseUrl}/v1`,
          openAiApiKey: apiKey,
          openAiModelId: modelId,
        },
        null,
        2
      );
    case "roo":
      return JSON.stringify(
        {
          apiProvider: "openai-compatible",
          baseUrl: `${cleanBaseUrl}/v1`,
          apiKey: apiKey,
          modelId: modelId,
        },
        null,
        2
      );
    case "continue":
      return JSON.stringify(
        {
          models: [
            {
              title: `Aldera - ${modelId}`,
              provider: "openai",
              model: modelId,
              apiKey: apiKey,
              apiBase: `${cleanBaseUrl}/v1`,
            },
          ],
        },
        null,
        2
      );
    case "openwebui":
      return JSON.stringify(
        {
          OPENAI_API_BASE_URL: `${cleanBaseUrl}/v1`,
          OPENAI_API_KEY: apiKey,
          DEFAULT_MODELS: modelId,
        },
        null,
        2
      );
    default:
      throw new Error(`Unsupported IDE target: ${target}`);
  }
}

/**
 * Filters the model catalog by category and text search query.
 */
export function filterModelCatalog(
  catalog: ModelCatalogItem[],
  options: {
    category?: ModelCategory;
    search?: string;
    activeOnly?: boolean;
  }
): ModelCatalogItem[] {
  return catalog.filter((m) => {
    if (options.activeOnly !== false && !m.isActive) return false;
    if (
      options.category &&
      options.category !== "All" &&
      m.category !== options.category
    ) {
      return false;
    }
    if (options.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      const matchId = m.id.toLowerCase().includes(q);
      const matchName = m.displayName.toLowerCase().includes(q);
      const matchBestFor = m.bestFor.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchBestFor) return false;
    }
    return true;
  });
}

// ============================================================================
// F11: Web ↔ Telegram Account Binding Contracts & Pure Utilities
// ============================================================================

export interface BindingTokenRecord {
  token: string;
  code: string;
  aldera_user_id: string;
  expires_at: Date;
  used_at: Date | null;
}

export function generateBindingToken(): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function generateBindingCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function createBindingRecord(alderaUserId: string): BindingTokenRecord {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
  return {
    token: generateBindingToken(),
    code: generateBindingCode(),
    aldera_user_id: alderaUserId,
    expires_at: expiresAt,
    used_at: null,
  };
}

export function verifyBindingToken(
  record: BindingTokenRecord,
  tokenOrCode: string,
  now = new Date()
): { valid: boolean; error?: string } {
  if (record.used_at !== null) {
    return { valid: false, error: "Binding token has already been used" };
  }
  if (now > record.expires_at) {
    return { valid: false, error: "Binding token has expired (15m limit)" };
  }
  if (record.token !== tokenOrCode && record.code !== tokenOrCode) {
    return { valid: false, error: "Invalid binding token or verification code" };
  }
  return { valid: true };
}

// ============================================================================
// F12: Telegram Bot Interactive /models Command Formatting
// ============================================================================

export function formatTelegramModelsMessage(
  category: ModelCategory,
  models: ModelCatalogItem[]
): string {
  const filtered = filterModelCatalog(models, { category, activeOnly: true });
  const header = `🤖 <b>Daftar Model AI Relay (${category})</b>\n\n`;
  if (filtered.length === 0) {
    return `${header}<i>Tidak ada model aktif untuk kategori ini.</i>`;
  }

  const items = filtered
    .map((m) => {
      const inputStr = `Rp ${m.inputPricePerM.toLocaleString("id-ID")}`;
      const outputStr = `Rp ${m.outputPricePerM.toLocaleString("id-ID")}`;
      return `• <b>${m.displayName}</b>\n  ID: <code>${m.id}</code>\n  Harga: In ${inputStr} / Out ${outputStr} per 1M\n  Konteks: ${m.contextWindow.toLocaleString("id-ID")} token\n  <i>${m.bestFor}</i>`;
    })
    .join("\n\n");

  return `${header}${items}`;
}

// ============================================================================
// F13: Multi-channel Low Balance Alerts Pure Logic
// ============================================================================

export const LOW_BALANCE_DEFAULT_THRESHOLD = 5000;
export const ALERT_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 hours

export interface LowBalanceAlertCheck {
  shouldAlert: boolean;
  reason?: string;
  telegramPayload?: {
    telegramId: number;
    message: string;
  };
  whatsappPayload?: {
    target: string;
    message: string;
  };
}

export function evaluateLowBalanceAlert(params: {
  userId: number;
  currentBalance: number;
  threshold?: number;
  lastAlertSentAt: Date | null;
  telegramId?: number;
  phone?: string;
  now?: Date;
}): LowBalanceAlertCheck {
  const threshold = params.threshold ?? LOW_BALANCE_DEFAULT_THRESHOLD;
  const now = params.now ?? new Date();

  if (params.currentBalance >= threshold) {
    return { shouldAlert: false, reason: "Balance above threshold" };
  }

  if (params.lastAlertSentAt) {
    const elapsed = now.getTime() - params.lastAlertSentAt.getTime();
    if (elapsed < ALERT_COOLDOWN_MS) {
      return {
        shouldAlert: false,
        reason: `Alert suppressed: within 12h cooldown (${Math.round((ALERT_COOLDOWN_MS - elapsed) / 60000)}m remaining)`,
      };
    }
  }

  const formattedBalance = `Rp ${params.currentBalance.toLocaleString("id-ID")}`;
  const message = `⚠️ Peringatan Saldo Rendah Aldera AI Relay!\nSisa saldo Anda: ${formattedBalance}.\nPanggilan API akan diblokir jika saldo habis. Segera lakukan top-up di https://aldera.tech/dashboard/ai-relay atau ketik /topup pada bot.`;

  return {
    shouldAlert: true,
    telegramPayload: params.telegramId
      ? {
          telegramId: params.telegramId,
          message,
        }
      : undefined,
    whatsappPayload: params.phone
      ? {
          target: params.phone,
          message,
        }
      : undefined,
  };
}

// ============================================================================
// F14: Admin Dynamic Pricing Manager Contracts & Pure Calculations

// ============================================================================

export interface ModelPricingItem {
  id: number;
  model_name: string;
  display_name: string;
  input_price_per_m: number;
  output_price_per_m: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  upstream_input_cost_per_m?: number;
  upstream_output_cost_per_m?: number;
  input_gross_margin_pct?: number;
  output_gross_margin_pct?: number;
  avg_gross_margin_pct?: number;
}

export const UPSTREAM_BASELINE_COSTS: Record<
  string,
  { inputCostPerM: number; outputCostPerM: number }
> = {
  "gpt-4o": { inputCostPerM: 30000, outputCostPerM: 120000 },
  "gpt-4o-mini": { inputCostPerM: 1500, outputCostPerM: 6000 },
  "claude-3-5-sonnet-20241022": { inputCostPerM: 36000, outputCostPerM: 180000 },
  "claude-3-5-haiku-20241022": { inputCostPerM: 10000, outputCostPerM: 50000 },
  "deepseek-chat": { inputCostPerM: 1000, outputCostPerM: 2000 },
  "deepseek-reasoner": { inputCostPerM: 5000, outputCostPerM: 20000 },
};

/**
 * Calculates gross profit margin percentage between selling price and upstream cost per 1M tokens.
 * Formula: ((sellingPricePerM - upstreamCostPerM) / sellingPricePerM) * 100
 */
export function calculateGrossMarginPercentage(
  sellingPricePerM: number,
  upstreamCostPerM: number
): number {
  if (sellingPricePerM <= 0) {
    if (upstreamCostPerM <= 0) return 0;
    return -100;
  }
  const margin = ((sellingPricePerM - upstreamCostPerM) / sellingPricePerM) * 100;
  return Number(margin.toFixed(2));
}

// ============================================================================
// F15: Admin 9router Model Sync Contracts & Diffing Logic
// ============================================================================

export interface NineRouterModelItem {
  id: string;
  object: "model";
  created?: number;
  owned_by?: string;
}

export interface ModelSyncDiffResult {
  newModels: NineRouterModelItem[];
  syncedModels: NineRouterModelItem[];
  missingUpstreamModels: string[];
}

export function diffModelsWithUpstream(
  upstreamModels: NineRouterModelItem[],
  localModelIds: string[]
): ModelSyncDiffResult {
  const localSet = new Set(localModelIds);
  const upstreamSet = new Set(upstreamModels.map((m) => m.id));

  const newModels = upstreamModels.filter((m) => !localSet.has(m.id));
  const syncedModels = upstreamModels.filter((m) => localSet.has(m.id));
  const missingUpstreamModels = localModelIds.filter((id) => !upstreamSet.has(id));

  return {
    newModels,
    syncedModels,
    missingUpstreamModels,
  };
}

// ============================================================================
// F16: Admin Financial, Audit & Topup Approval Contracts
// ============================================================================

export interface FinancialMetrics {
  totalOmzet: number;
  totalTokens: number;
  totalUsageCost: number;
  netMargin: number;
}

export interface FinancialMetricsSummary extends FinancialMetrics {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export interface PendingTopupRequestItem {
  id: number;
  user_id: number;
  amount: number;
  unique_code: number;
  total_transfer: number;
  proof_file_id: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: Date;
  user_name: string;
  user_username: string | null;
  telegram_id: string | number | null;
  web_user_id: string | null;
}

export function calculateFinancialMetrics(
  approvedTopups: TopupRequestRecord[],
  usageLogs: UsageLogRecord[]
): FinancialMetrics {
  const totalOmzet = approvedTopups.reduce((acc, t) => acc + t.amount, 0);
  const totalTokens = usageLogs.reduce(
    (acc, l) => acc + l.prompt_tokens + l.completion_tokens,
    0
  );
  const totalUsageCost = usageLogs.reduce((acc, l) => acc + l.total_cost, 0);
  const netMargin = totalOmzet - totalUsageCost;

  return {
    totalOmzet,
    totalTokens,
    totalUsageCost,
    netMargin,
  };
}

