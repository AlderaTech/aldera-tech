export function getTelegramConfig() {
  const rawBaseUrl =
    process.env.TELEGRAM_API_BASE_URL ||
    process.env.TELEGRAM_MOCK_URL ||
    process.env.TELEGRAM_API_URL ||
    process.env.TELEGRAM_API_SERVER ||
    "https://api.telegram.org";
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  const isMockMode = baseUrl !== "https://api.telegram.org";
  const botToken =
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.BOT_TOKEN ||
    (isMockMode ? "test_mock_token" : undefined);

  return { baseUrl, botToken, isMockMode };
}

export interface SendTelegramMessageArgs {
  chatId: number | string;
  text: string;
  replyMarkup?: Record<string, unknown>;
  parseMode?: "HTML" | "Markdown" | "MarkdownV2";
}

export interface SendTelegramResult {
  success: boolean;
  simulated?: boolean;
  error?: string;
}

/**
 * Sends a message to a Telegram chat/user via Telegram Bot API.
 * Falls back to console.log simulation if BOT_TOKEN is not configured and not in mock mode.
 */
export async function sendTelegramMessage({
  chatId,
  text,
  replyMarkup,
  parseMode = "HTML",
}: SendTelegramMessageArgs): Promise<SendTelegramResult> {
  if (!chatId) {
    return { success: false, error: "Invalid Telegram chat ID" };
  }

  const { baseUrl, botToken, isMockMode } = getTelegramConfig();

  if (!botToken && !isMockMode) {
    console.log("[Telegram] No BOT_TOKEN configured. Simulated message:", {
      chatId,
      text,
      hasReplyMarkup: !!replyMarkup,
    });
    return { success: true, simulated: true };
  }

  try {
    const url = `${baseUrl}/bot${botToken}/sendMessage`;
    const body: Record<string, unknown> = {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    };
    if (replyMarkup) {
      body.reply_markup = replyMarkup;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        error: `Telegram API error ${res.status}: ${errText}`,
      };
    }

    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("[Telegram] Send failed:", error);
    return { success: false, error };
  }
}
