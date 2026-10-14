import { describe, it, expect } from "bun:test";
import crypto from "node:crypto";
import {
  timingSafeEquals,
  verifyMidtransSignature,
  interpretMidtransStatus,
  getMidtransSnapUrl,
} from "./midtrans";

describe("Midtrans Helper & Signature Verification", () => {
  const serverKey = "SB-Mid-server-test-key-12345";
  const orderId = "INV-2026-0001";
  const statusCode = "200";
  const grossAmount = "15000000.00";

  function computeTestSignature(
    o: string,
    s: string,
    g: string,
    k: string
  ): string {
    return crypto.createHash("sha512").update(`${o}${s}${g}${k}`).digest("hex");
  }

  it("verifies valid Midtrans SHA-512 signature accurately", () => {
    const validSignature = computeTestSignature(
      orderId,
      statusCode,
      grossAmount,
      serverKey
    );

    const isValid = verifyMidtransSignature({
      orderId,
      statusCode,
      grossAmount,
      signatureKey: validSignature,
      serverKey,
    });

    expect(isValid).toBe(true);
  });

  it("rejects tampered signature key", () => {
    const invalidSignature =
      "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";

    const isValid = verifyMidtransSignature({
      orderId,
      statusCode,
      grossAmount,
      signatureKey: invalidSignature,
      serverKey,
    });

    expect(isValid).toBe(false);
  });

  it("rejects when server key differs", () => {
    const validSignature = computeTestSignature(
      orderId,
      statusCode,
      grossAmount,
      serverKey
    );

    const isValid = verifyMidtransSignature({
      orderId,
      statusCode,
      grossAmount,
      signatureKey: validSignature,
      serverKey: "different-server-key",
    });

    expect(isValid).toBe(false);
  });

  it("returns false for empty keys or parameters", () => {
    expect(
      verifyMidtransSignature({
        orderId,
        statusCode,
        grossAmount,
        signatureKey: "",
        serverKey,
      })
    ).toBe(false);

    expect(
      verifyMidtransSignature({
        orderId,
        statusCode,
        grossAmount,
        signatureKey: "some-key",
        serverKey: "",
      })
    ).toBe(false);
  });

  it("timingSafeEquals prevents timing attacks and handles length mismatch", () => {
    expect(timingSafeEquals("secret-token", "secret-token")).toBe(true);
    expect(timingSafeEquals("secret-token", "secret-tokan")).toBe(false);
    expect(timingSafeEquals("secret-token", "short")).toBe(false);
  });
});

describe("Midtrans Transaction Status Interpreter", () => {
  it("maps settlement and capture with accept to SUCCESS", () => {
    expect(interpretMidtransStatus("settlement")).toBe("SUCCESS");
    expect(interpretMidtransStatus("capture", "accept")).toBe("SUCCESS");
    expect(interpretMidtransStatus("capture")).toBe("SUCCESS");
  });

  it("maps challenge fraud status or pending to PENDING", () => {
    expect(interpretMidtransStatus("capture", "challenge")).toBe("PENDING");
    expect(interpretMidtransStatus("pending")).toBe("PENDING");
  });

  it("maps deny, expire, cancel, failure to FAILED", () => {
    expect(interpretMidtransStatus("deny")).toBe("FAILED");
    expect(interpretMidtransStatus("expire")).toBe("FAILED");
    expect(interpretMidtransStatus("cancel")).toBe("FAILED");
    expect(interpretMidtransStatus("failure")).toBe("FAILED");
  });

  it("maps refund and partial_refund to REFUNDED", () => {
    expect(interpretMidtransStatus("refund")).toBe("REFUNDED");
    expect(interpretMidtransStatus("partial_refund")).toBe("REFUNDED");
  });

  it("handles case-insensitivity and unknown statuses", () => {
    expect(interpretMidtransStatus("SETTLEMENT")).toBe("SUCCESS");
    expect(interpretMidtransStatus("DENY")).toBe("FAILED");
    expect(interpretMidtransStatus("something_unknown")).toBe("UNKNOWN");
  });
});

describe("Midtrans Snap API Endpoints", () => {
  it("defaults to Sandbox URL in development environment", () => {
    const originalEnv = process.env.MIDTRANS_IS_PRODUCTION;
    delete process.env.MIDTRANS_IS_PRODUCTION;

    expect(getMidtransSnapUrl()).toBe(
      "https://app.sandbox.midtrans.com/snap/v1/transactions"
    );

    process.env.MIDTRANS_IS_PRODUCTION = "true";
    expect(getMidtransSnapUrl()).toBe(
      "https://app.midtrans.com/snap/v1/transactions"
    );

    if (originalEnv !== undefined) {
      process.env.MIDTRANS_IS_PRODUCTION = originalEnv;
    } else {
      delete process.env.MIDTRANS_IS_PRODUCTION;
    }
  });
});
