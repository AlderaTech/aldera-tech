"use server";

import { auth } from "@/auth";
import { queryRouter } from "@/lib/router-db";
import { ensureRouterUser } from "@/lib/actions/ai-relay";
import {
  generateBindingToken,
  generateBindingCode,
} from "@/lib/ai-relay-utils";

export interface BindingStatusResult {
  isBound: boolean;
  telegramId?: string | number | null;
  telegramUsername?: string | null;
  balance?: number;
  activeToken?: {
    token: string;
    code: string;
    deepLink: string;
    expiresAt: string;
  } | null;
}

export interface GenerateBindingResult {
  success: boolean;
  token?: string;
  code?: string;
  deepLink?: string;
  expiresAt?: string;
  error?: string;
}

export interface UnlinkResult {
  success: boolean;
  error?: string;
}

function getBotUsername(): string {
  return (
    process.env.TELEGRAM_BOT_USERNAME ||
    process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ||
    "AlderaRelayBot"
  );
}

/**
 * Generates an account binding token and 6-digit verification code,
 * storing them in `aldera_router.account_binding_tokens` with a 15-minute expiration.
 */
export async function generateBindingTokenAction(): Promise<GenerateBindingResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized: Silakan login terlebih dahulu.",
      };
    }
    const webUserId = session.user.id;
    await ensureRouterUser(
      session.user.id,
      session.user.name ?? undefined,
      session.user.email ?? undefined
    );

    const token = generateBindingToken();
    const code = generateBindingCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await queryRouter(
      `INSERT INTO account_binding_tokens (token, code, aldera_user_id, expires_at)
       VALUES ($1, $2, $3, $4);`,
      [token, code, webUserId, expiresAt]
    );

    const botUsername = getBotUsername();
    const deepLink = `https://t.me/${botUsername}?start=bind_${token}`;

    return {
      success: true,
      token,
      code,
      deepLink,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    console.error("[generateBindingTokenAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Gagal membuat token binding",
    };
  }
}

/**
 * Checks the Telegram account binding status for the currently authenticated user.
 */
export async function getBindingStatusAction(): Promise<BindingStatusResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { isBound: false };
    }
    const webUserId = session.user.id;

    // Check user table in aldera_router
    const userRes = await queryRouter<{
      id: string | number;
      telegram_id: string | number | null;
      username: string | null;
      balance: string | number;
    }>(
      `SELECT id, telegram_id, username, balance
       FROM users
       WHERE web_user_id = $1
       LIMIT 1;`,
      [webUserId]
    );

    if (userRes.rows.length > 0 && userRes.rows[0].telegram_id) {
      return {
        isBound: true,
        telegramId: userRes.rows[0].telegram_id,
        telegramUsername: userRes.rows[0].username,
        balance: Number(userRes.rows[0].balance),
      };
    }

    // Check if there is an active (unused and unexpired) token
    const tokenRes = await queryRouter<{
      token: string;
      code: string;
      expires_at: Date;
    }>(
      `SELECT token, code, expires_at
       FROM account_binding_tokens
       WHERE aldera_user_id = $1 AND used_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1;`,
      [webUserId]
    );

    if (tokenRes.rows.length > 0) {
      const row = tokenRes.rows[0];
      const botUsername = getBotUsername();
      return {
        isBound: false,
        activeToken: {
          token: row.token,
          code: row.code,
          deepLink: `https://t.me/${botUsername}?start=bind_${row.token}`,
          expiresAt: new Date(row.expires_at).toISOString(),
        },
      };
    }

    return { isBound: false, activeToken: null };
  } catch (error) {
    console.error("[getBindingStatusAction] Error:", error);
    return { isBound: false };
  }
}

/**
 * Unlinks the Telegram account from the currently authenticated web account.
 */
export async function unlinkTelegramAccountAction(): Promise<UnlinkResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized: Silakan login terlebih dahulu.",
      };
    }
    const webUserId = session.user.id;

    await queryRouter(
      `UPDATE users
       SET telegram_id = NULL, updated_at = NOW()
       WHERE web_user_id = $1;`,
      [webUserId]
    );

    return { success: true };
  } catch (error) {
    console.error("[unlinkTelegramAccountAction] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Gagal memutuskan tautan Telegram",
    };
  }
}
