const API_URL = process.env.WHATSAPP_API_URL || "https://api.fonnte.com/send";

export type SendWhatsAppArgs = {
  to: string;
  message: string;
};

/**
 * Send a WhatsApp message via Fonnte API (https://api.fonnte.com/send).
 * Falls back to console.log if WHATSAPP_API_KEY is not configured.
 */
export async function sendWhatsApp({ to, message }: SendWhatsAppArgs) {
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
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `API error ${res.status}: ${text}` };
    }

    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("[WhatsApp] Send failed:", error);
    return { success: false, error };
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
