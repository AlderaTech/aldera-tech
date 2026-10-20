const API_URL = process.env.WHATSAPP_API_URL || "https://api.fonnte.com/send";

export type SendWhatsAppArgs = {
  to: string;
  message: string;
};

export type SendWhatsAppResult = {
  success: boolean;
  error?: string;
  simulated?: boolean;
  timeout?: boolean;
  status?: number;
  code?: string;
};

/**
 * Send a WhatsApp message via Fonnte API (https://api.fonnte.com/send).
 * Falls back to console.log if WHATSAPP_API_KEY is not configured.
 * Hardened with a 4-second circuit breaker timeout and graceful fallback.
 */
export async function sendWhatsApp({
  to,
  message,
}: SendWhatsAppArgs): Promise<SendWhatsAppResult> {
  const phone = normalizePhone(to);
  if (!phone) return { success: false, error: "Invalid phone number" };

  const apiKey = process.env.WHATSAPP_API_KEY;
  const apiUrl = process.env.WHATSAPP_API_URL || API_URL;

  if (!apiUrl || !apiKey) {
    console.log("[WhatsApp] No API configured. Message:", {
      to: phone,
      message,
    });
    return { success: true, simulated: true };
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: apiKey,
      },
      body: JSON.stringify({ target: phone, message }),
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const isRateLimit = res.status === 429;
      return {
        success: false,
        status: res.status,
        code: isRateLimit ? "RATE_LIMITED" : "EXTERNAL_ERROR",
        error: isRateLimit
          ? `API error 429: Rate limit exceeded`
          : `API error ${res.status}: ${text}`,
      };
    }

    return { success: true };
  } catch (err) {
    const hasCode = typeof err === "object" && err !== null && "code" in err;
    const errorCode = hasCode ? (err as { code: unknown }).code : undefined;
    const isTimeout =
      (err instanceof Error &&
        (err.name === "TimeoutError" || err.name === "AbortError")) ||
      errorCode === "ETIMEDOUT" ||
      errorCode === "ABORT_ERR";

    const error = isTimeout
      ? "WhatsApp service timeout (4s exceeded)"
      : err instanceof Error
      ? err.message
      : "Unknown error";

    console.error("[WhatsApp] Send failed:", error);
    return {
      success: false,
      error,
      timeout: isTimeout,
      code: isTimeout ? "EXTERNAL_TIMEOUT" : "EXTERNAL_ERROR",
    };
  }
}

/** Normalize phone to international format (62xxx) */
function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits || digits.length < 9) return null;
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  return digits;
}
