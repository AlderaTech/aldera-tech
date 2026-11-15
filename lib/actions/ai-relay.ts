"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requestRelayCompletion } from "@/lib/relay-upstream";
import { generateApiKey as generateCryptoApiKey } from "@/lib/ai-relay-auth";
import { queryRouter, transactionRouter } from "@/lib/router-db";
import {
  calculateTokenCost,
  generateUniqueCode,
  calculateTotalTransfer,
  aggregateUsageLogs,
  calculateModelHealth,
  MODEL_METADATA_MAP,
  type ApiKeyRecord,
  type BalanceTransactionRecord,
  type ModelCatalogItem,
  type ModelCategory,
  type ModelHealthStatus,
  type PlaygroundChatResult,
  type TopupRequestRecord,
  type UsageAnalyticsSummary,
  type UsageLogRecord,
} from "@/lib/ai-relay-utils";

// Re-export types for consumers
export type {
  ApiKeyRecord,
  BalanceTransactionRecord,
  ModelCatalogItem,
  ModelCategory,
  ModelHealthStatus,
  PlaygroundChatResult,
  TopupRequestRecord,
  UsageAnalyticsSummary,
  UsageLogRecord,
};

// ============================================================================
// Internal User Resolution & Authentication Helper
// ============================================================================

/**
 * Links or creates the corresponding user record in `aldera_router.users` table
 * using the NextAuth web_user_id.
 */
async function ensureRouterAccount(
  webUserId: string,
  name?: string,
  email?: string,
  allowInactive = false
): Promise<{ id: number; balance: number }> {
  const existing = await queryRouter<{
    id: string | number;
    balance: string | number;
    is_active: boolean;
  }>(
    "SELECT id, balance, is_active FROM users WHERE web_user_id = $1 LIMIT 1;",
    [webUserId]
  );

  if (existing.rows.length > 0) {
    if (!allowInactive && !existing.rows[0].is_active)
      throw new Error(
        "Akses AI sementara diblokir. Silakan hubungi administrator."
      );
    return {
      id: Number(existing.rows[0].id),
      balance: Number(existing.rows[0].balance),
    };
  }

  const username = email || `user_${webUserId.slice(0, 8)}`;
  const fullName = name || "AI Relay Client";

  const inserted = await queryRouter<{
    id: string | number;
    balance: string | number;
  }>(
    `INSERT INTO users (web_user_id, full_name, username, balance, is_active)
     VALUES ($1, $2, $3, 0.0000, true)
     ON CONFLICT (web_user_id) DO UPDATE SET updated_at = NOW()
     RETURNING id, balance;`,
    [webUserId, fullName, username]
  );

  return {
    id: Number(inserted.rows[0].id),
    balance: Number(inserted.rows[0].balance),
  };
}

export async function ensureRouterUser(
  webUserId: string,
  name?: string,
  email?: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.id !== webUserId) throw new Error("Forbidden");
  return ensureRouterAccount(
    webUserId,
    session.user.name ?? name,
    session.user.email ?? email
  );
}

async function resolveCurrentUser(allowInactive = false): Promise<{
  id: number;
  balance: number;
  webUserId: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Anda harus login untuk mengakses AI Relay.");
  }

  const routerUser = await ensureRouterAccount(
    session.user.id,
    session.user.name ?? undefined,
    session.user.email ?? undefined,
    allowInactive
  );

  return {
    id: routerUser.id,
    balance: routerUser.balance,
    webUserId: session.user.id,
  };
}

// ============================================================================
// Server Actions: F4 (Balance, Top-up & Ledger History)
// ============================================================================

export async function getUserBalance(): Promise<{
  balance: number;
  userId: number;
  webUserId: string;
}> {
  const user = await resolveCurrentUser(true);
  const res = await queryRouter<{ balance: string | number }>(
    "SELECT balance FROM users WHERE id = $1;",
    [user.id]
  );
  const balance =
    res.rows.length > 0 ? Number(res.rows[0].balance) : user.balance;

  return {
    balance,
    userId: user.id,
    webUserId: user.webUserId,
  };
}

export async function createTopupRequest(amount: number): Promise<{
  success: boolean;
  topup: TopupRequestRecord;
}> {
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 9999999999) {
    throw new Error("Nominal top-up harus berupa angka positif.");
  }

  const user = await resolveCurrentUser(true);
  const uniqueCode = generateUniqueCode();
  const totalTransfer = calculateTotalTransfer(amount, uniqueCode);

  const res = await queryRouter<{
    id: string | number;
    user_id: string | number;
    amount: string | number;
    unique_code: number;
    total_transfer: string | number;
    proof_file_id: string | null;
    status: "pending" | "approved" | "rejected";
    admin_id: string | number | null;
    created_at: Date;
    approved_at: Date | null;
  }>(
    `INSERT INTO topup_requests (user_id, amount, unique_code, total_transfer, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING id, user_id, amount, unique_code, total_transfer, proof_file_id, status, admin_id, created_at, approved_at;`,
    [user.id, amount, uniqueCode, totalTransfer]
  );

  const row = res.rows[0];
  const topup: TopupRequestRecord = {
    id: Number(row.id),
    user_id: Number(row.user_id),
    amount: Number(row.amount),
    unique_code: Number(row.unique_code),
    total_transfer: Number(row.total_transfer),
    proof_file_id: row.proof_file_id,
    status: row.status,
    admin_id: row.admin_id ? Number(row.admin_id) : null,
    created_at: new Date(row.created_at),
    approved_at: row.approved_at ? new Date(row.approved_at) : null,
  };

  return { success: true, topup };
}

export async function uploadTopupProof(
  topupId: number,
  proofFileId: string
): Promise<{
  success: boolean;
  topup: TopupRequestRecord;
}> {
  if (!topupId || isNaN(topupId)) {
    throw new Error("ID tiket top-up tidak valid.");
  }
  if (!proofFileId || !proofFileId.trim()) {
    throw new Error("Berkas bukti transfer wajib disertakan.");
  }

  const user = await resolveCurrentUser(true);
  const session = await auth();
  const proof = await prisma.file.findFirst({
    where: {
      id: proofFileId.trim(),
      topupId,
      scope: "TOPUP_PROOF",
      uploaderId: session!.user.id,
    },
    select: { id: true },
  });
  if (!proof)
    throw new Error("Unggah bukti transfer untuk tiket ini terlebih dahulu.");

  const res = await queryRouter<{
    id: string | number;
    user_id: string | number;
    amount: string | number;
    unique_code: number;
    total_transfer: string | number;
    proof_file_id: string | null;
    status: "pending" | "approved" | "rejected";
    admin_id: string | number | null;
    created_at: Date;
    approved_at: Date | null;
  }>(
    `UPDATE topup_requests
     SET proof_file_id = $1
     WHERE id = $2 AND user_id = $3 AND status = 'pending'
     RETURNING id, user_id, amount, unique_code, total_transfer, proof_file_id, status, admin_id, created_at, approved_at;`,
    [proofFileId.trim(), topupId, user.id]
  );

  if (res.rows.length === 0) {
    throw new Error(
      "Tiket top-up tidak ditemukan atau sudah tidak berstatus pending."
    );
  }

  const row = res.rows[0];
  const topup: TopupRequestRecord = {
    id: Number(row.id),
    user_id: Number(row.user_id),
    amount: Number(row.amount),
    unique_code: Number(row.unique_code),
    total_transfer: Number(row.total_transfer),
    proof_file_id: row.proof_file_id,
    status: row.status,
    admin_id: row.admin_id ? Number(row.admin_id) : null,
    created_at: new Date(row.created_at),
    approved_at: row.approved_at ? new Date(row.approved_at) : null,
  };

  return { success: true, topup };
}

export async function getBalanceTransactions(
  limit = 50
): Promise<BalanceTransactionRecord[]> {
  const user = await resolveCurrentUser(true);
  const res = await queryRouter<{
    id: string | number;
    user_id: string | number;
    amount: string | number;
    transaction_type: "topup" | "usage" | "manual_adjust";
    balance_before: string | number;
    balance_after: string | number;
    reference_id: string | null;
    notes: string | null;
    created_at: Date;
  }>(
    `SELECT id, user_id, amount, transaction_type, balance_before, balance_after, reference_id, notes, created_at
     FROM balance_transactions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2;`,
    [user.id, limit]
  );

  return res.rows.map((row) => ({
    id: Number(row.id),
    user_id: Number(row.user_id),
    amount: Number(row.amount),
    transaction_type: row.transaction_type,
    balance_before: Number(row.balance_before),
    balance_after: Number(row.balance_after),
    reference_id: row.reference_id,
    notes: row.notes,
    created_at: new Date(row.created_at),
  }));
}

// ============================================================================
// Server Actions: F3 (API Key Lifecycle Management)
// ============================================================================

export async function listApiKeys(): Promise<ApiKeyRecord[]> {
  const user = await resolveCurrentUser(true);
  const res = await queryRouter<{
    id: string | number;
    user_id: string | number;
    key_prefix: string;
    label: string;
    is_active: boolean;
    total_spent: string | number;
    last_used_at: Date | null;
    created_at: Date;
  }>(
    `SELECT id, user_id, key_prefix, label, is_active, total_spent, last_used_at, created_at
     FROM api_keys
     WHERE user_id = $1
     ORDER BY created_at DESC;`,
    [user.id]
  );

  return res.rows.map((row) => ({
    id: Number(row.id),
    user_id: Number(row.user_id),
    key_prefix: row.key_prefix,
    label: row.label,
    is_active: row.is_active,
    total_spent: Number(row.total_spent),
    last_used_at: row.last_used_at ? new Date(row.last_used_at) : null,
    created_at: new Date(row.created_at),
  }));
}

export async function createApiKey(label: string): Promise<{
  success: boolean;
  id: number;
  rawKey: string;
  keyPrefix: string;
  label: string;
}> {
  const user = await resolveCurrentUser();
  const cleanLabel = (label || "default").trim().slice(0, 100);
  const { rawKey, keyPrefix, keyHash } = generateCryptoApiKey();

  const res = await queryRouter<{ id: string | number }>(
    `INSERT INTO api_keys (user_id, key_hash, key_prefix, label, is_active)
     VALUES ($1, $2, $3, $4, true)
     RETURNING id;`,
    [user.id, keyHash, keyPrefix, cleanLabel]
  );

  return {
    success: true,
    id: Number(res.rows[0].id),
    rawKey,
    keyPrefix,
    label: cleanLabel,
  };
}

export async function revokeApiKey(
  keyId: number
): Promise<{ success: boolean }> {
  const user = await resolveCurrentUser(true);

  await queryRouter(
    `UPDATE api_keys
     SET is_active = false, updated_at = NOW()
     WHERE id = $1 AND user_id = $2;`,
    [keyId, user.id]
  );

  return { success: true };
}

// ============================================================================
// Server Actions: F5 (Token Usage Analytics & Activity Logs)
// ============================================================================

export async function getUsageLogs(limit = 100): Promise<UsageLogRecord[]> {
  const user = await resolveCurrentUser(true);
  const res = await queryRouter<{
    id: string | number;
    user_id: string | number;
    api_key_id: string | number | null;
    model: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_cost: string | number;
    duration_ms: number;
    is_stream: boolean;
    created_at: Date;
  }>(
    `SELECT id, user_id, api_key_id, model, prompt_tokens, completion_tokens, total_cost, duration_ms, is_stream, created_at
     FROM usage_logs
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2;`,
    [user.id, limit]
  );

  return res.rows.map((row) => ({
    id: Number(row.id),
    user_id: Number(row.user_id),
    api_key_id: row.api_key_id ? Number(row.api_key_id) : null,
    model: row.model,
    prompt_tokens: row.prompt_tokens,
    completion_tokens: row.completion_tokens,
    total_cost: Number(row.total_cost),
    duration_ms: row.duration_ms,
    is_stream: row.is_stream,
    created_at: new Date(row.created_at),
  }));
}

export async function getUsageAnalytics(): Promise<UsageAnalyticsSummary> {
  const logs = await getUsageLogs(500);
  return aggregateUsageLogs(logs);
}

// ============================================================================
// Server Actions: F7 & F9 (Model Catalog & Health Metrics)
// ============================================================================

export async function getModelCatalog(): Promise<ModelCatalogItem[]> {
  try {
    const res = await queryRouter<{
      model_name: string;
      display_name: string;
      input_price_per_m: string | number;
      output_price_per_m: string | number;
      is_active: boolean;
    }>(
      `SELECT model_name, display_name, input_price_per_m, output_price_per_m, is_active
       FROM model_pricing
       ORDER BY input_price_per_m ASC;`
    );

    if (!res?.rows || res.rows.length === 0) {
      return [];
    }

    return res.rows.map((row) => {
      const meta = MODEL_METADATA_MAP[row.model_name] ?? {
        category: "Coding" as ModelCategory,
        contextWindow: 128000,
        bestFor: "General LLM tasks and completions",
      };

      return {
        id: row.model_name,
        displayName: row.display_name,
        category: meta.category,
        contextWindow: meta.contextWindow,
        inputPricePerM: Number(row.input_price_per_m),
        outputPricePerM: Number(row.output_price_per_m),
        bestFor: meta.bestFor,
        isActive: row.is_active,
      };
    });
  } catch {
    throw new Error("Katalog model belum dapat dimuat. Silakan coba kembali.");
  }
}

export async function getModelHealthMetrics(): Promise<ModelHealthStatus[]> {
  const res = await queryRouter<{
    id: string | number;
    user_id: string | number;
    api_key_id: string | number | null;
    model: string;
    prompt_tokens: number;
    completion_tokens: number;
    total_cost: string | number;
    duration_ms: number;
    is_stream: boolean;
    created_at: Date;
  }>(
    `SELECT id, user_id, api_key_id, model, prompt_tokens, completion_tokens, total_cost, duration_ms, is_stream, created_at
     FROM usage_logs
     ORDER BY created_at DESC
     LIMIT 1000;`
  );

  const logs: UsageLogRecord[] = res.rows.map((r) => ({
    id: Number(r.id),
    user_id: Number(r.user_id),
    api_key_id: r.api_key_id ? Number(r.api_key_id) : null,
    model: r.model,
    prompt_tokens: r.prompt_tokens,
    completion_tokens: r.completion_tokens,
    total_cost: Number(r.total_cost),
    duration_ms: r.duration_ms,
    is_stream: r.is_stream,
    created_at: new Date(r.created_at),
  }));

  const catalog = await getModelCatalog();
  return catalog.map((m) => calculateModelHealth(m.id, logs));
}

// ============================================================================
// Server Actions: F6 (In-Browser AI Playground Relay & Atomic Debit)
// ============================================================================

export async function executePlaygroundChat(params: {
  model: string;
  prompt: string;
  systemPrompt?: string;
}): Promise<PlaygroundChatResult> {
  const { model, prompt, systemPrompt } = params;
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt tidak boleh kosong.");
  }
  if (!model || !model.trim()) {
    throw new Error("Model harus dipilih.");
  }

  const user = await resolveCurrentUser();

  // 1. Fetch model pricing
  const pricingRes = await queryRouter<{
    input_price_per_m: string | number;
    output_price_per_m: string | number;
    is_active: boolean;
  }>(
    `SELECT input_price_per_m, output_price_per_m, is_active
     FROM model_pricing
     WHERE model_name = $1 LIMIT 1;`,
    [model]
  );

  if (pricingRes.rows.length === 0 || !pricingRes.rows[0].is_active) {
    throw new Error(`Model '${model}' tidak tersedia atau tidak aktif.`);
  }

  const inputPrice = Number(pricingRes.rows[0].input_price_per_m);
  const outputPrice = Number(pricingRes.rows[0].output_price_per_m);
  if (
    ![inputPrice, outputPrice].every(
      (value) => Number.isFinite(value) && value >= 0
    )
  )
    throw new Error("Tarif model tidak valid.");

  // 2. Pre-flight balance check
  const balanceCheck = await queryRouter<{ balance: string | number }>(
    "SELECT balance FROM users WHERE id = $1;",
    [user.id]
  );
  const initialBalance =
    balanceCheck.rows.length > 0 ? Number(balanceCheck.rows[0].balance) : 0;
  if (initialBalance <= 0) {
    throw new Error(
      "Insufficient balance: Saldo Anda tidak mencukupi untuk melakukan chat. Silakan top-up terlebih dahulu."
    );
  }

  const startTime = Date.now();
  const { content, promptTokens, completionTokens } =
    await requestRelayCompletion(model, prompt, systemPrompt);

  const durationMs = Math.max(50, Date.now() - startTime);
  const totalCost = calculateTokenCost(
    promptTokens,
    completionTokens,
    inputPrice,
    outputPrice
  );

  // 4. Atomic Transaction: Debit balance, record usage_log and balance_transactions
  const transactionResult = await transactionRouter(async (client) => {
    // Acquire row-level lock on user to ensure strict serialized debit
    const userRow = await client.query<{
      balance: string | number;
      is_active: boolean;
    }>("SELECT balance, is_active FROM users WHERE id = $1 FOR UPDATE;", [
      user.id,
    ]);

    if (!userRow.rows[0]?.is_active)
      throw new Error(
        "Akses AI sementara diblokir. Silakan hubungi administrator."
      );
    const currentBal = Number(userRow.rows[0].balance);
    if (currentBal < totalCost) {
      throw new Error(
        `Insufficient balance: Saldo Anda (Rp ${currentBal.toLocaleString("id-ID")}) tidak mencukupi untuk biaya pemakaian Rp ${totalCost.toLocaleString("id-ID")}.`
      );
    }

    const newBal = Number((currentBal - totalCost).toFixed(4));

    // A. Insert permanent audit record into usage_logs
    const logRes = await client.query<{ id: string | number }>(
      `INSERT INTO usage_logs (user_id, api_key_id, model, prompt_tokens, completion_tokens, total_cost, duration_ms, is_stream)
       VALUES ($1, NULL, $2, $3, $4, $5, $6, false)
       RETURNING id;`,
      [user.id, model, promptTokens, completionTokens, totalCost, durationMs]
    );
    const usageLogId = String(logRes.rows[0].id);

    // B. Atomically update user balance
    await client.query(
      "UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2;",
      [newBal, user.id]
    );

    // C. Insert immutable ledger entry into balance_transactions satisfying all trigger invariants
    if (totalCost > 0)
      await client.query(
        `INSERT INTO balance_transactions (user_id, amount, transaction_type, reference_id, balance_before, balance_after, notes)
       VALUES ($1, $2, 'usage', $3, $4, $5, $6);`,
        [
          user.id,
          -totalCost,
          usageLogId,
          currentBal,
          newBal,
          `Playground relay: ${model} (${promptTokens} in, ${completionTokens} out)`,
        ]
      );

    return newBal;
  });

  return {
    success: true,
    content,
    model,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
      totalCostIdr: totalCost,
    },
    durationMs,
    newBalance: transactionResult,
  };
}
