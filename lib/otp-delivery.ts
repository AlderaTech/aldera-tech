import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";
import { waTemplates } from "@/lib/whatsapp-templates";

/** A provider failure must not become an OTP success or a resend cooldown. */
export async function deliverVerificationOtp(
  phone: string,
  identifier: string,
  otp: string
): Promise<boolean> {
  let delivered = false;
  try {
    const result = await sendWhatsApp({
      to: phone,
      message: waTemplates.verificationOtp({ code: otp, ttlMinutes: 10 })
        .message,
    });
    delivered = result.success && !result.simulated;
  } catch {
    console.error("Verification OTP delivery failed.");
  }
  if (!delivered) {
    await prisma.verificationToken.deleteMany({
      where: { identifier, token: otp, type: "WHATSAPP_OTP" },
    });
  }
  return delivered;
}
