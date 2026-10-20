/**
 * Cloudflare Turnstile token server verification helper.
 */

export type VerifyTurnstileResult = {
  success: boolean;
  error?: string;
  timeout?: boolean;
  status?: number;
  code?: string;
};

export async function verifyTurnstileToken(
  token: string
): Promise<VerifyTurnstileResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // In development or test environments where secret is not configured, bypass verification
  if (!secretKey) {
    return { success: true };
  }

  if (!token) {
    return {
      success: false,
      error: "Token verifikasi captcha tidak ditemukan.",
      code: "MISSING_TOKEN",
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
        signal: AbortSignal.timeout(4000),
      }
    );

    if (!res.ok) {
      if (res.status === 429) {
        return {
          success: false,
          error:
            "Terlalu banyak permintaan verifikasi keamanan (HTTP 429). Silakan tunggu beberapa saat.",
          status: 429,
          code: "RATE_LIMITED",
        };
      }
      return {
        success: false,
        error: `Layanan verifikasi keamanan sedang mengalami gangguan (HTTP ${res.status}).`,
        status: res.status,
        code: "EXTERNAL_ERROR",
      };
    }

    const outcome = (await res.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!outcome.success) {
      return {
        success: false,
        error: "Verifikasi keamanan Turnstile gagal. Silakan coba kembali.",
        code: "VERIFICATION_FAILED",
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

    console.error("Turnstile verification error:", err);
    if (isTimeout) {
      return {
        success: false,
        error: "Verifikasi keamanan timeout (4s). Silakan coba kembali.",
        timeout: true,
        code: "EXTERNAL_TIMEOUT",
      };
    }

    return {
      success: false,
      error: "Terjadi kesalahan saat memverifikasi keamanan.",
      code: "EXTERNAL_ERROR",
    };
  }
}
