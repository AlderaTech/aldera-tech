/**
 * Cloudflare Turnstile token server verification helper.
 */

export async function verifyTurnstileToken(
  token: string
): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // In development or test environments where secret is not configured, bypass verification
  if (!secretKey) {
    return { success: true };
  }

  if (!token) {
    return {
      success: false,
      error: "Token verifikasi captcha tidak ditemukan.",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const outcome = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!outcome.success) {
      return {
        success: false,
        error: "Verifikasi keamanan Turnstile gagal. Silakan coba kembali.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return {
      success: false,
      error: "Terjadi kesalahan saat memverifikasi keamanan.",
    };
  }
}
