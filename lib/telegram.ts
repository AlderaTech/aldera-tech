const BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || process.env.BOT_TOKEN;

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
 * Falls back to console.log simulation if BOT_TOKEN is not configured.
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

  if (!BOT_TOKEN) {
    console.log("[Telegram] No BOT_TOKEN configured. Simulated message:", {
      chatId,
      text,
      hasReplyMarkup: !!replyMarkup,
    });
    return { success: true, simulated: true };
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
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
      return { success: false, error: `Telegram API error ${res.status}: ${errText}` };
    }

    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("[Telegram] Send failed:", error);
    return { success: false, error };
  }
}
