import { describe, expect, it } from "bun:test";
import type { InvoiceStatus } from "@prisma/client";
import type { ClientInvoiceItem } from "../_types/invoice";
import { summarizeInvoices } from "./invoice-summary";

function invoice(status: InvoiceStatus, total: number): ClientInvoiceItem {
  return {
    id: status,
    number: status,
    status,
    total,
    issueDate: new Date("2026-01-01"),
    dueDate: new Date("2026-01-15"),
    project: null,
    paymentProofUrl: null,
  };
}

describe("Ringkasan seluruh invoice pengguna", () => {
  it("memisahkan pembayaran, verifikasi, dan lunas berdasarkan status resmi", () => {
    const summary = summarizeInvoices([
      invoice("SENT", 1000000.25),
      invoice("OVERDUE", 2000000.5),
      invoice("PENDING_VERIFICATION", 750000),
      invoice("PAID", 1500000),
      invoice("CANCELLED", 9000000),
      invoice("DRAFT", 8000000),
    ]);
    expect(summary).toEqual({
      awaiting: { amount: 3000000.75, count: 2 },
      verification: { amount: 750000, count: 1 },
      paid: { amount: 1500000, count: 1 },
    });
  });
  it("mempertahankan nol tanpa menganggap invoice kosong sebagai lunas", () => {
    expect(summarizeInvoices([])).toEqual({
      awaiting: { amount: 0, count: 0 },
      verification: { amount: 0, count: 0 },
      paid: { amount: 0, count: 0 },
    });
    expect(summarizeInvoices([invoice("SENT", 0)]).awaiting).toEqual({
      amount: 0,
      count: 1,
    });
  });
  it("mencakup seluruh hasil tanpa membatasi pada jumlah kartu yang terlihat", () => {
    expect(
      summarizeInvoices(
        Array.from({ length: 130 }, () => invoice("SENT", 125000))
      ).awaiting
    ).toEqual({ amount: 16250000, count: 130 });
  });
});
