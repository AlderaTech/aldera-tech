import { queryRouter } from "@/lib/router-db";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";
import { waTemplates } from "@/lib/whatsapp-templates";
import { sendTelegramMessage } from "@/lib/telegram";
import {
  evaluateLowBalanceAlert,
  type LowBalanceAlertCheck,
} from "@/lib/ai-relay-utils";

export const BALANCE_GUARD_THRESHOLD = 10000; // Rp 10.000

export function escapeTelegramHtml(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export interface BalanceGuardUserRecord {
  id: number;
  telegram_id: string | number | null;
  web_user_id: string | null;
  username: string | null;
  full_name: string;
  balance: number;
  last_alert_at: Date | null;
  last_topup_at: Date | null;
}

export interface BalanceGuardAlertResult {
  userId: number;
  name: string;
  balance: number;
  telegramStatus?: "sent" | "simulated" | "skipped" | "failed";
  whatsappStatus?: "sent" | "simulated" | "skipped" | "failed";
  error?: string;
}

export interface BalanceGuardRunSummary {
  totalChecked: number;
  alertsDispatched: number;
  alertsSuppressed: number;
  results: BalanceGuardAlertResult[];
  timestamp: string;
}

/**
 * Initializes the `user_alert_cooldowns` table in `aldera_router` if it does not yet exist.
 */
export async function ensureAlertCooldownsTable(): Promise<void> {
  await queryRouter(`
    CREATE TABLE IF NOT EXISTS user_alert_cooldowns (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      last_low_balance_alert_at TIMESTAMPTZ NOT NULL,
      alert_count INT NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_alert_cooldowns_user_id ON user_alert_cooldowns(user_id);
  `);
}

/**
 * Runs the Balance Guard check across all users with balance < Rp 10.000.
 * Dispatches multi-channel alerts (Telegram Bot + WhatsApp Fonnte) respecting a 12-hour cooldown,
 * which resets automatically if a top-up occurred after the last alert.
 */
export async function runBalanceGuard(
  threshold = BALANCE_GUARD_THRESHOLD,
  now = new Date()
): Promise<BalanceGuardRunSummary> {
  await ensureAlertCooldownsTable();

  // Query candidate users who have balance below threshold
  const candidatesRes = await queryRouter<{
    id: string | number;
    telegram_id: string | number | null;
    web_user_id: string | null;
    username: string | null;
    full_name: string;
    balance: string | number;
    last_alert_at: Date | null;
    last_topup_at: Date | null;
  }>(
    `SELECT
       u.id,
       u.telegram_id,
       u.web_user_id,
       u.username,
       u.full_name,
       u.balance,
       c.last_low_balance_alert_at AS last_alert_at,
       (
         SELECT MAX(bt.created_at)
         FROM balance_transactions bt
         WHERE bt.user_id = u.id AND bt.transaction_type = 'topup'
       ) AS last_topup_at
     FROM users u
     LEFT JOIN user_alert_cooldowns c ON c.user_id = u.id
     WHERE u.balance < $1 AND u.is_active = true;`,
    [threshold]
  );

  const results: BalanceGuardAlertResult[] = [];
  let dispatchedCount = 0;
  let suppressedCount = 0;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aldera.tech";
  const topupUrl = `${appUrl}/dashboard/ai-relay?tab=billing`;

  for (const row of candidatesRes.rows) {
    const userId = Number(row.id);
    const balance = Number(row.balance);
    const lastAlertAt = row.last_alert_at ? new Date(row.last_alert_at) : null;
    const lastTopupAt = row.last_topup_at ? new Date(row.last_topup_at) : null;
    const telegramId = row.telegram_id ? Number(row.telegram_id) : undefined;

    // Evaluate cooldown:
    // If topup occurred after the last alert, cooldown is reset
    let effectiveLastAlert = lastAlertAt;
    if (lastAlertAt && lastTopupAt && lastTopupAt > lastAlertAt) {
      effectiveLastAlert = null;
    }

    // Check Prisma user phone if web_user_id is linked
    let phone: string | undefined;
    let clientName = row.full_name;

    if (row.web_user_id) {
      try {
        const webUser = await prisma.user.findUnique({
          where: { id: row.web_user_id },
          select: { name: true, phone: true },
        });
        if (webUser) {
          if (webUser.name) clientName = webUser.name;
          if (webUser.phone) phone = webUser.phone;
        }
      } catch (err) {
        console.warn(
          `[BalanceGuard] Failed to fetch web user ${row.web_user_id}:`,
          err
        );
      }
    }

    const check: LowBalanceAlertCheck = evaluateLowBalanceAlert({
      userId,
      currentBalance: balance,
      threshold,
      lastAlertSentAt: effectiveLastAlert,
      telegramId,
      phone,
      now,
    });

    if (!check.shouldAlert) {
      suppressedCount++;
      continue;
    }

    const alertResult: BalanceGuardAlertResult = {
      userId,
      name: clientName,
      balance,
    };

    let alertSent = false;

    // 1. Telegram Dispatch
    if (telegramId) {
      const formattedBalance = `Rp ${balance.toLocaleString("id-ID")}`;
      const safeClientName = escapeTelegramHtml(clientName);
      const tgText =
        `⚠️ <b>Peringatan Saldo Rendah Aldera AI Relay</b>\n\n` +
        `Halo <b>${safeClientName}</b>,\n` +
        `Sisa saldo AI Relay Anda saat ini adalah <b>${formattedBalance}</b> (di bawah batas minimum Rp ${threshold.toLocaleString("id-ID")}).\n\n` +
        `Panggilan API akan ditolak jika saldo habis. Segera lakukan pengisian saldo agar integrasi IDE (Cursor, Cline) tetap lancar.`;

      const tgReplyMarkup = {
        inline_keyboard: [
          [
            {
              text: "💳 Top-up Saldo Sekarang",
              url: topupUrl,
            },
          ],
        ],
      };

      const tgRes = await sendTelegramMessage({
        chatId: telegramId,
        text: tgText,
        replyMarkup: tgReplyMarkup,
        parseMode: "HTML",
      });

      if (tgRes.success) {
        alertResult.telegramStatus = tgRes.simulated ? "simulated" : "sent";
        alertSent = true;
      } else {
        alertResult.telegramStatus = "failed";
        alertResult.error = tgRes.error;
      }
    } else {
      alertResult.telegramStatus = "skipped";
    }

    // 2. WhatsApp Fonnte Dispatch
    if (phone) {
      const tpl = waTemplates.lowBalanceAlert({
        userName: clientName,
        balance,
        threshold,
        topupUrl,
      });

      const waRes = await sendWhatsApp({
        to: phone,
        message: `*${tpl.title}*\n\n${tpl.message}`,
      });

      if (waRes.success) {
        alertResult.whatsappStatus = waRes.simulated ? "simulated" : "sent";
        alertSent = true;
      } else {
        alertResult.whatsappStatus = "failed";
        if (!alertResult.error) alertResult.error = waRes.error;
      }
    } else {
      alertResult.whatsappStatus = "skipped";
    }

    // Record or update alert cooldown if at least one channel dispatch succeeded/simulated
    if (alertSent) {
      await queryRouter(
        `INSERT INTO user_alert_cooldowns (user_id, last_low_balance_alert_at, alert_count)
         VALUES ($1, $2, 1)
         ON CONFLICT (user_id) DO UPDATE
         SET last_low_balance_alert_at = EXCLUDED.last_low_balance_alert_at,
             alert_count = user_alert_cooldowns.alert_count + 1;`,
        [userId, now]
      );
      dispatchedCount++;
    }

    results.push(alertResult);
  }

  return {
    totalChecked: candidatesRes.rows.length,
    alertsDispatched: dispatchedCount,
    alertsSuppressed: suppressedCount,
    results,
    timestamp: now.toISOString(),
  };
}
