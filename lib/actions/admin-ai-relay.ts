"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/permissions";
import {
  queryRouter,
  transactionRouter,
  verifyLedgerInvariants,
  type LedgerInvariantResult,
} from "@/lib/router-db";
import { ensureRouterUser } from "@/lib/actions/ai-relay";
import {
  calculateGrossMarginPercentage,
  diffModelsWithUpstream,
  UPSTREAM_BASELINE_COSTS,
  type ModelPricingItem,
  type NineRouterModelItem,
  type ModelSyncDiffResult,
  type FinancialMetrics,
  type FinancialMetricsSummary,
  type PendingTopupRequestItem,
} from "@/lib/ai-relay-utils";

export type {
  ModelPricingItem,
  NineRouterModelItem,
  ModelSyncDiffResult,
  FinancialMetrics,
  FinancialMetricsSummary,
  PendingTopupRequestItem,
};

// ============================================================================
// Internal Admin Authorization Resolver
// ============================================================================

async function resolveAdminSession(): Promise<{
  adminId: number;
  webUserId: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error(
      "Unauthorized: Anda harus login untuk melakukan aksi admin."
    );
  }

  const roles =
    session.user.roles ?? (session.user.role ? [session.user.role] : []);
  if (!isAdmin(roles)) {
    throw new Error("Forbidden: Operasi AI Relay dibatasi khusus untuk ADMIN.");
  }

  let adminId = 1;
  try {
    const adminUser = await ensureRouterUser(
      session.user.id,
      session.user.name ?? "Admin",
      session.user.email ?? "admin@aldera.tech"
    );
    if (adminUser?.id) adminId = adminUser.id;
  } catch {
    // fallback adminId = 1
  }

  return { adminId, webUserId: session.user.id };
}

// ============================================================================
// F14: Dynamic Pricing Manager Actions
// ============================================================================

/**
 * Lists all model pricing rows from `aldera_router.model_pricing` enriched with upstream margins.
 */
export async function getModelPricings(): Promise<ModelPricingItem[]> {
  await resolveAdminSession();

  const res = await queryRouter<{
    id: string | number;
    model_name: string;
    display_name: string;
    input_price_per_m: string | number;
    output_price_per_m: string | number;
    is_active: boolean;
    created_at: string | Date;
    updated_at: string | Date;
  }>(
    `SELECT id, model_name, display_name, input_price_per_m, output_price_per_m, is_active, created_at, updated_at
     FROM model_pricing
     ORDER BY id ASC;`
  );

  return res.rows.map((row) => {
    const inputPrice = Number(row.input_price_per_m);
    const outputPrice = Number(row.output_price_per_m);

    // Baseline upstream cost lookup or fallback estimate (70% of selling price)
    const baseline = UPSTREAM_BASELINE_COSTS[row.model_name] ?? {
      inputCostPerM: Number((inputPrice * 0.7).toFixed(4)),
      outputCostPerM: Number((outputPrice * 0.7).toFixed(4)),
    };

    const inputMargin = calculateGrossMarginPercentage(
      inputPrice,
      baseline.inputCostPerM
    );
    const outputMargin = calculateGrossMarginPercentage(
      outputPrice,
      baseline.outputCostPerM
    );
    const avgMargin = Number(((inputMargin + outputMargin) / 2).toFixed(2));

    return {
      id: Number(row.id),
      model_name: row.model_name,
      display_name: row.display_name,
      input_price_per_m: inputPrice,
      output_price_per_m: outputPrice,
      is_active: row.is_active,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      upstream_input_cost_per_m: baseline.inputCostPerM,
      upstream_output_cost_per_m: baseline.outputCostPerM,
      input_gross_margin_pct: inputMargin,
      output_gross_margin_pct: outputMargin,
      avg_gross_margin_pct: avgMargin,
    };
  });
}

/**
 * Creates a new model pricing entry in `model_pricing`.
 */
export async function createModelPricing(data: {
  model_name: string;
  display_name: string;
  input_price_per_m: number;
  output_price_per_m: number;
  is_active?: boolean;
  upstream_input_cost_per_m?: number;
}): Promise<{ success: boolean; id: number }> {
  await resolveAdminSession();

  if (!data.model_name || !data.model_name.trim()) {
    throw new Error("Model name tidak boleh kosong.");
  }
  if (!data.display_name || !data.display_name.trim()) {
    throw new Error("Display name tidak boleh kosong.");
  }
  if (data.input_price_per_m < 0 || data.output_price_per_m < 0) {
    throw new Error("Harga tidak boleh bernilai negatif.");
  }

  const res = await queryRouter<{ id: string | number }>(
    `INSERT INTO model_pricing (model_name, display_name, input_price_per_m, output_price_per_m, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id;`,
    [
      data.model_name.trim(),
      data.display_name.trim(),
      data.input_price_per_m,
      data.output_price_per_m,
      data.is_active ?? true,
    ]
  );

  const modelId = Number(res.rows[0].id);

  if (data.upstream_input_cost_per_m !== undefined) {
    const inputCost = Number(data.upstream_input_cost_per_m);
    UPSTREAM_BASELINE_COSTS[data.model_name.trim()] = {
      inputCostPerM: inputCost,
      outputCostPerM: inputCost * 2,
    };
    try {
      await queryRouter(
        "UPDATE model_pricing SET upstream_input_cost_per_m = $1 WHERE id = $2;",
        [inputCost, modelId]
      );
    } catch {
      // column may not exist, in-memory baseline updated
    }
  }

  try {
    revalidatePath("/admin/ai-relay");
    revalidatePath("/dashboard/ai-relay");
  } catch {
    // ignore revalidatePath when called in tests
  }

  return { success: true, id: modelId };
}

/**
 * Updates an existing model pricing entry in `model_pricing`.
 */
export async function updateModelPricing(
  id: number,
  data: {
    display_name?: string;
    input_price_per_m?: number;
    output_price_per_m?: number;
    is_active?: boolean;
    upstream_input_cost_per_m?: number;
  }
): Promise<{ success: boolean }> {
  await resolveAdminSession();

  const updates: string[] = ["updated_at = NOW()"];
  const params: unknown[] = [id];
  let paramIdx = 2;

  if (data.display_name !== undefined) {
    if (!data.display_name.trim()) {
      throw new Error("Display name tidak boleh kosong.");
    }
    updates.push(`display_name = $${paramIdx++}`);
    params.push(data.display_name.trim());
  }

  if (data.input_price_per_m !== undefined) {
    if (data.input_price_per_m < 0) {
      throw new Error("Input price tidak boleh negatif.");
    }
    updates.push(`input_price_per_m = $${paramIdx++}`);
    params.push(data.input_price_per_m);
  }

  if (data.output_price_per_m !== undefined) {
    if (data.output_price_per_m < 0) {
      throw new Error("Output price tidak boleh negatif.");
    }
    updates.push(`output_price_per_m = $${paramIdx++}`);
    params.push(data.output_price_per_m);
  }

  if (data.is_active !== undefined) {
    updates.push(`is_active = $${paramIdx++}`);
    params.push(data.is_active);
  }

  if (data.upstream_input_cost_per_m !== undefined) {
    const inputCost = Number(data.upstream_input_cost_per_m);
    try {
      const existing = await queryRouter<{ model_name: string }>(
        "SELECT model_name FROM model_pricing WHERE id = $1 LIMIT 1;",
        [id]
      );
      if (existing.rows.length > 0) {
        const mName = existing.rows[0].model_name;
        const prev = UPSTREAM_BASELINE_COSTS[mName];
        UPSTREAM_BASELINE_COSTS[mName] = {
          inputCostPerM: inputCost,
          outputCostPerM: prev?.outputCostPerM ?? inputCost * 2,
        };
      }
    } catch {
      // ignore
    }
    try {
      await queryRouter(
        "UPDATE model_pricing SET upstream_input_cost_per_m = $1 WHERE id = $2;",
        [inputCost, id]
      );
    } catch {
      // column may not exist
    }
  }

  const sql = `UPDATE model_pricing SET ${updates.join(", ")} WHERE id = $1;`;
  await queryRouter(sql, params);

  try {
    revalidatePath("/admin/ai-relay");
    revalidatePath("/dashboard/ai-relay");
  } catch {
    // ignore
  }

  return { success: true };
}

/**
 * Toggles the `is_active` status of a model pricing entry.
 */
export async function toggleModelPricingStatus(
  id: number,
  isActive: boolean
): Promise<{ success: boolean }> {
  await resolveAdminSession();

  await queryRouter(
    "UPDATE model_pricing SET is_active = $1, updated_at = NOW() WHERE id = $2;",
    [isActive, id]
  );

  try {
    revalidatePath("/admin/ai-relay");
    revalidatePath("/dashboard/ai-relay");
  } catch {
    // ignore
  }

  return { success: true };
}

/**
 * Deletes a model pricing entry from `model_pricing`.
 */
export async function deleteModelPricing(
  id: number
): Promise<{ success: boolean }> {
  await resolveAdminSession();

  await queryRouter("DELETE FROM model_pricing WHERE id = $1;", [id]);

  try {
    revalidatePath("/admin/ai-relay");
    revalidatePath("/dashboard/ai-relay");
  } catch {
    // ignore
  }

  return { success: true };
}

// ============================================================================
// F15: 9router Upstream Model Sync Actions
// ============================================================================

/**
 * Fetches model catalog from upstream 9router (`/v1/models`) and diffs against local catalog.
 */
export async function syncModelsFromUpstream(options?: {
  mockUpstreamModels?: NineRouterModelItem[];
}): Promise<{
  success: boolean;
  upstreamUrl: string;
  diff: ModelSyncDiffResult;
  error?: string;
}> {
  await resolveAdminSession();

  const localRes = await queryRouter<{ model_name: string }>(
    "SELECT model_name FROM model_pricing;"
  );
  const localModelIds = localRes.rows.map((r) => r.model_name);

  // If mock data provided (for tests / offline simulation)
  if (options?.mockUpstreamModels) {
    const diff = diffModelsWithUpstream(
      options.mockUpstreamModels,
      localModelIds
    );
    return {
      success: true,
      upstreamUrl: "mock://upstream/v1/models",
      diff,
    };
  }

  const rawBaseUrl =
    process.env.NINE_ROUTER_BASE_URL || "http://localhost:20128";
  const upstreamUrl = `${rawBaseUrl.replace(/\/+$/, "")}/v1/models`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Upstream returned HTTP ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as { data?: NineRouterModelItem[] };
    const upstreamModels = data.data || [];
    const diff = diffModelsWithUpstream(upstreamModels, localModelIds);

    return {
      success: true,
      upstreamUrl,
      diff,
    };
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : "Gagal terhubung ke 9router";

    // Fallback: return diff against empty or local to avoid crashing the dashboard
    return {
      success: false,
      upstreamUrl,
      error: `Koneksi ke upstream 9router gagal: ${errorMsg}`,
      diff: {
        newModels: [],
        syncedModels: [],
        missingUpstreamModels: localModelIds,
      },
    };
  }
}

/**
 * 1-click activates a new model discovered from 9router into `model_pricing`.
 */
export async function activateNewModelFromUpstream(
  modelId: string,
  customPricing?: {
    displayName?: string;
    inputPricePerM?: number;
    outputPricePerM?: number;
  }
): Promise<{ success: boolean; id: number }> {
  await resolveAdminSession();

  // Check if model already exists
  const existing = await queryRouter<{ id: string | number }>(
    "SELECT id FROM model_pricing WHERE model_name = $1 LIMIT 1;",
    [modelId]
  );

  if (existing.rows.length > 0) {
    const existingId = Number(existing.rows[0].id);
    await queryRouter(
      "UPDATE model_pricing SET is_active = true, updated_at = NOW() WHERE id = $1;",
      [existingId]
    );
    return { success: true, id: existingId };
  }

  // Generate friendly display name if not provided
  const displayName =
    customPricing?.displayName ||
    modelId
      .replace(/^ag\//, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  // Default pricing baseline: Rp 25,000 / 50,000 per 1M tokens unless provided
  const inputPrice = customPricing?.inputPricePerM ?? 25000;
  const outputPrice = customPricing?.outputPricePerM ?? 50000;

  return await createModelPricing({
    model_name: modelId,
    display_name: displayName,
    input_price_per_m: inputPrice,
    output_price_per_m: outputPrice,
    is_active: true,
  });
}

// ============================================================================
// F16: Financial & Audit Dashboard Actions
// ============================================================================

/**
 * Aggregates financial overview metrics (total omzet, token volume, usage cost, net margin, queue counts).
 */
export async function getFinancialMetrics(): Promise<FinancialMetricsSummary> {
  await resolveAdminSession();

  const [omzetRes, usageRes, pendingRes, rejectedRes] = await Promise.all([
    queryRouter<{ total_omzet: string | number; count: string | number }>(
      `SELECT COALESCE(SUM(amount), 0) AS total_omzet, COUNT(*) as count
       FROM topup_requests
       WHERE status = 'approved';`
    ),
    queryRouter<{
      total_tokens: string | number;
      total_cost: string | number;
      request_count: string | number;
    }>(
      `SELECT 
         COALESCE(SUM(prompt_tokens + completion_tokens), 0) AS total_tokens,
         COALESCE(SUM(total_cost), 0) AS total_cost,
         COUNT(*) as request_count
       FROM usage_logs;`
    ),
    queryRouter<{ count: string | number }>(
      "SELECT COUNT(*) as count FROM topup_requests WHERE status = 'pending';"
    ),
    queryRouter<{ count: string | number }>(
      "SELECT COUNT(*) as count FROM topup_requests WHERE status = 'rejected';"
    ),
  ]);

  const totalOmzet = Number(omzetRes.rows[0]?.total_omzet ?? 0);
  const totalTokens = Number(usageRes.rows[0]?.total_tokens ?? 0);
  const totalUsageCost = Number(usageRes.rows[0]?.total_cost ?? 0);
  const netMargin = totalOmzet - totalUsageCost;
  const pendingCount = Number(pendingRes.rows[0]?.count ?? 0);
  const approvedCount = Number(omzetRes.rows[0]?.count ?? 0);
  const rejectedCount = Number(rejectedRes.rows[0]?.count ?? 0);

  return {
    totalOmzet,
    totalTokens,
    totalUsageCost,
    netMargin,
    pendingCount,
    approvedCount,
    rejectedCount,
  };
}

/**
 * Lists all pending top-up tickets with user details for approval queue.
 */
export async function getPendingTopupRequests(): Promise<
  PendingTopupRequestItem[]
> {
  await resolveAdminSession();

  const res = await queryRouter<{
    id: string | number;
    user_id: string | number;
    amount: string | number;
    unique_code: number;
    total_transfer: string | number;
    proof_file_id: string | null;
    status: "pending" | "approved" | "rejected";
    created_at: string | Date;
    user_name: string | null;
    user_username: string | null;
    telegram_id: string | number | null;
    web_user_id: string | null;
  }>(
    `SELECT 
       tr.id,
       tr.user_id,
       tr.amount,
       tr.unique_code,
       tr.total_transfer,
       tr.proof_file_id,
       tr.status,
       tr.created_at,
       COALESCE(u.full_name, 'Unknown User') as user_name,
       u.username as user_username,
       u.telegram_id,
       u.web_user_id
     FROM topup_requests tr
     LEFT JOIN users u ON u.id = tr.user_id
     WHERE tr.status = 'pending'
     ORDER BY tr.created_at DESC;`
  );

  return res.rows.map((row) => ({
    id: Number(row.id),
    user_id: Number(row.user_id),
    amount: Number(row.amount),
    unique_code: Number(row.unique_code),
    total_transfer: Number(row.total_transfer),
    proof_file_id: row.proof_file_id,
    status: row.status,
    created_at: new Date(row.created_at),
    user_name: row.user_name || "Unknown User",
    user_username: row.user_username,
    telegram_id: row.telegram_id,
    web_user_id: row.web_user_id,
  }));
}

/**
 * Atomically approves a pending top-up ticket:
 * 1. Checks and locks ticket in 'pending' status.
 * 2. Increments user balance.
 * 3. Appends immutable entry to `balance_transactions`.
 * 4. Updates ticket to 'approved' with admin_id and approved_at.
 */
export async function approveTopupRequest(
  requestId: number
): Promise<{ success: boolean; newBalance: number }> {
  const { adminId } = await resolveAdminSession();

  const result = await transactionRouter(async (client) => {
    // 1. Lock and retrieve top-up ticket
    const ticketRes = await client.query<{
      id: string | number;
      user_id: string | number;
      amount: string | number;
      status: string;
      unique_code: number;
    }>(
      "SELECT id, user_id, amount, status, unique_code FROM topup_requests WHERE id = $1 FOR UPDATE;",
      [requestId]
    );

    if (ticketRes.rows.length === 0) {
      throw new Error(`Tiket top-up #${requestId} tidak ditemukan.`);
    }

    const ticket = ticketRes.rows[0];
    if (ticket.status !== "pending") {
      throw new Error(
        `Tiket top-up #${requestId} sudah diproses (status: ${ticket.status}).`
      );
    }

    const userId = Number(ticket.user_id);
    const amount = Number(ticket.amount);

    if (amount <= 0) {
      throw new Error("Nominal top-up tidak valid.");
    }

    // 2. Lock user and get current balance
    const userRes = await client.query<{
      id: string | number;
      balance: string | number;
    }>("SELECT id, balance FROM users WHERE id = $1 FOR UPDATE;", [userId]);

    if (userRes.rows.length === 0) {
      throw new Error(
        `User #${userId} untuk tiket #${requestId} tidak ditemukan.`
      );
    }

    const currentBalance = Number(userRes.rows[0].balance);
    const newBalance = Number((currentBalance + amount).toFixed(4));

    // 3. Update user balance
    await client.query(
      "UPDATE users SET balance = $1, updated_at = NOW() WHERE id = $2;",
      [newBalance, userId]
    );

    // 4. Append immutable ledger transaction (satisfies all trigger constraints)
    await client.query(
      `INSERT INTO balance_transactions (
         user_id, amount, transaction_type, reference_id, balance_before, balance_after, notes, created_at
       ) VALUES ($1, $2, 'topup', $3, $4, $5, $6, NOW());`,
      [
        userId,
        amount,
        String(requestId),
        currentBalance,
        newBalance,
        `Topup approved by admin #${adminId}`,
      ]
    );

    // 5. Update topup ticket to approved status with required audit metadata
    await client.query(
      `UPDATE topup_requests
       SET status = 'approved',
           admin_id = $2,
           approved_at = NOW()
       WHERE id = $1;`,
      [requestId, adminId]
    );

    return newBalance;
  });

  try {
    revalidatePath("/admin/ai-relay");
    revalidatePath("/dashboard/ai-relay");
  } catch {
    // ignore
  }

  return { success: true, newBalance: result };
}

/**
 * Rejects a pending top-up ticket.
 */
export async function rejectTopupRequest(
  requestId: number,
  _reason?: string
): Promise<{ success: boolean }> {
  await resolveAdminSession();
  void _reason;

  await transactionRouter(async (client) => {
    const ticketRes = await client.query<{
      id: string | number;
      status: string;
    }>("SELECT id, status FROM topup_requests WHERE id = $1 FOR UPDATE;", [
      requestId,
    ]);

    if (ticketRes.rows.length === 0) {
      throw new Error(`Tiket top-up #${requestId} tidak ditemukan.`);
    }

    const ticket = ticketRes.rows[0];
    if (ticket.status !== "pending") {
      throw new Error(
        `Tiket top-up #${requestId} sudah diproses (status: ${ticket.status}).`
      );
    }

    await client.query(
      "UPDATE topup_requests SET status = 'rejected' WHERE id = $1;",
      [requestId]
    );
  });

  try {
    revalidatePath("/admin/ai-relay");
    revalidatePath("/dashboard/ai-relay");
  } catch {
    // ignore
  }

  return { success: true };
}

/**
 * Runs the database diagnostic function `verify_ledger_invariants()`
 * and returns the status of all 5 financial and telemetry invariants.
 */
export async function runLedgerAudit(): Promise<LedgerInvariantResult[]> {
  await resolveAdminSession();
  return await verifyLedgerInvariants();
}
