import "server-only";

const API_URL = process.env.WHATSAPP_API_URL;
const API_KEY = process.env.WHATSAPP_API_KEY;

export type SendWhatsAppArgs = {
  to: string;
  message: string;
};

/**
 * Send a WhatsApp message via configured API provider (Fonnte/Wablas/etc).
 * Falls back to console.log if credentials are not configured.
 */
export async function sendWhatsApp({ to, message }: SendWhatsAppArgs) {
  const phone = normalizePhone(to);
  if (!phone) return { success: false, error: "Invalid phone number" };

  if (!API_URL || !API_KEY) {
    console.log("[WhatsApp] No API configured. Message:", { to: phone, message });
    return { success: true, simulated: true };
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: API_KEY,
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
