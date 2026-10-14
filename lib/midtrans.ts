import crypto from "node:crypto";

/**
 * Midtrans Configuration & Helper Utilities
 *
 * Menggunakan native fetch dan Node.js crypto API untuk kompatibilitas
 * penuh dengan runtime Next.js 16 tanpa dependensi SDK usang.
 */

export type MidtransConfig = {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
};

export function getMidtransConfig(): MidtransConfig {
  return {
    serverKey: process.env.MIDTRANS_SERVER_KEY ?? "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY ?? "",
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  };
}

export function getMidtransSnapUrl(): string {
  const { isProduction } = getMidtransConfig();
  return isProduction
    ? "https://app.midtrans.com/snap/v1/transactions"
    : "https://app.sandbox.midtrans.com/snap/v1/transactions";
}

export type MidtransCustomerDetails = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

export type MidtransItemDetail = {
  id?: string;
  name: string;
  price: number;
  quantity: number;
};

export type CreateSnapTransactionInput = {
  orderId: string;
  grossAmount: number;
  customer?: MidtransCustomerDetails;
  items?: MidtransItemDetail[];
};

export type SnapTransactionResult = {
  token: string;
  redirectUrl: string;
};

/**
 * Membandingkan dua string secara aman dari timing attacks.
 */
export function timingSafeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(a, "utf-8"),
    Buffer.from(b, "utf-8")
  );
}

/**
 * Menghitung dan memvalidasi signature SHA-512 dari notifikasi webhook Midtrans.
 * Formula Midtrans: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function verifyMidtransSignature(params: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
  serverKey: string;
}): boolean {
  if (!params.signatureKey || !params.serverKey) return false;
  const payload = `${params.orderId}${params.statusCode}${params.grossAmount}${params.serverKey}`;
  const computedHash = crypto
    .createHash("sha512")
    .update(payload)
    .digest("hex");
  return timingSafeEquals(computedHash, params.signatureKey);
}

/**
 * Mengirim permintaan pembuatan transaksi Snap ke server Midtrans.
 */
export async function createMidtransSnapTransaction(
  input: CreateSnapTransactionInput
): Promise<SnapTransactionResult> {
  const config = getMidtransConfig();
  if (!config.serverKey) {
    throw new Error(
      "MIDTRANS_SERVER_KEY belum dikonfigurasi di environment variables."
    );
  }

  const snapUrl = getMidtransSnapUrl();
  const authHeader = `Basic ${Buffer.from(`${config.serverKey}:`).toString(
    "base64"
  )}`;

  const bodyPayload = {
    transaction_details: {
      order_id: input.orderId,
      gross_amount: Math.round(input.grossAmount),
    },
    customer_details: input.customer
      ? {
          first_name: input.customer.firstName,
          last_name: input.customer.lastName,
          email: input.customer.email,
          phone: input.customer.phone,
        }
      : undefined,
    item_details: input.items?.map((item, idx) => ({
      id: item.id || `ITEM-${idx + 1}`,
      price: Math.round(item.price),
      quantity: item.quantity,
      name: item.name.slice(0, 50),
    })),
  };

  const response = await fetch(snapUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let parsedMessage = errorBody;
    try {
      const parsedJson = JSON.parse(errorBody);
      if (Array.isArray(parsedJson.error_messages)) {
        parsedMessage = parsedJson.error_messages.join(", ");
      } else if (parsedJson.message) {
        parsedMessage = parsedJson.message;
      }
    } catch {
      // gunakan errorBody mentah jika gagal parsing
    }
    throw new Error(
      `Midtrans API Error (${response.status}): ${parsedMessage}`
    );
  }

  const data = (await response.json()) as {
    token: string;
    redirect_url: string;
  };

  return {
    token: data.token,
    redirectUrl: data.redirect_url,
  };
}

export type MidtransPaymentState =
  "SUCCESS" | "PENDING" | "FAILED" | "REFUNDED" | "UNKNOWN";

/**
 * Menafsirkan status transaksi notifikasi Midtrans ke state internal aplikasi.
 */
export function interpretMidtransStatus(
  transactionStatus: string,
  fraudStatus?: string
): MidtransPaymentState {
  const status = transactionStatus.toLowerCase();
  const fraud = fraudStatus?.toLowerCase();

  if (status === "capture") {
    if (fraud === "challenge") return "PENDING";
    if (fraud === "accept" || !fraud) return "SUCCESS";
    return "FAILED";
  }

  if (status === "settlement") {
    return "SUCCESS";
  }

  if (status === "pending") {
    return "PENDING";
  }

  if (
    status === "deny" ||
    status === "expire" ||
    status === "cancel" ||
    status === "failure"
  ) {
    return "FAILED";
  }

  if (status === "refund" || status === "partial_refund") {
    return "REFUNDED";
  }

  return "UNKNOWN";
}
