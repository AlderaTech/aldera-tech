import { describe, it, expect } from "bun:test";

import {
  loginSchema,
  registerSchema,
  verifyOtpSchema,
  INDONESIAN_PHONE_REGEX,
} from "@/lib/validations/auth";
import { invoiceCreateSchema, invoiceItemSchema } from "@/lib/validations/invoice";
import { projectCreateSchema, milestoneSchema } from "@/lib/validations/project";
import { proposalCreateSchema, signatureSchema } from "@/lib/validations/proposal";
import { requestResetSchema, resetPasswordSchema } from "@/lib/validations/password-reset";
import { recurringInvoiceSchema } from "@/lib/validations/recurring-invoice";
import { siteSettingsSchema } from "@/lib/validations/settings";
import { contactSchema } from "@/lib/validations/contact";

describe("AT-L7: lib/validations/ comprehensive schema tests", () => {
  describe("Auth & Indonesian Phone Validations", () => {
    it("validates Indonesian phone number formats", () => {
      const validPhones = ["08123456789", "081234567890", "+628123456789", "6285712345678"];
      for (const p of validPhones) {
        expect(INDONESIAN_PHONE_REGEX.test(p)).toBe(true);
      }

      const invalidPhones = ["021123456", "12345", "0812abc", "+123456789", "0800123456"];
      for (const p of invalidPhones) {
        expect(INDONESIAN_PHONE_REGEX.test(p)).toBe(false);
      }
    });

    it("validates loginSchema requirements", () => {
      const valid = loginSchema.safeParse({
        email: "user@aldera.test",
        password: "SecretPassword123!",
      });
      expect(valid.success).toBe(true);

      const invalid = loginSchema.safeParse({
        email: "not-an-email",
        password: "",
      });
      expect(invalid.success).toBe(false);
    });

    it("enforces password confirmation match in registerSchema", () => {
      const mismatched = registerSchema.safeParse({
        name: "Test User",
        email: "user@aldera.test",
        phone: "08123456789",
        password: "Password123!",
        confirmPassword: "DifferentPassword123!",
      });
      expect(mismatched.success).toBe(false);

      const matched = registerSchema.safeParse({
        name: "Test User",
        email: "user@aldera.test",
        phone: "08123456789",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(matched.success).toBe(true);
    });

    it("validates verifyOtpSchema 6-digit numeric constraint", () => {
      expect(verifyOtpSchema.safeParse({ identifier: "08123456789", token: "123456" }).success).toBe(true);
      expect(verifyOtpSchema.safeParse({ identifier: "08123456789", token: "12345" }).success).toBe(false);
      expect(verifyOtpSchema.safeParse({ identifier: "08123456789", token: "12345a" }).success).toBe(false);
    });
  });

  describe("Invoice Schemas", () => {
    it("validates invoice item and invoice creation boundaries", () => {
      const validItem = invoiceItemSchema.safeParse({
        description: "Service A",
        quantity: 2,
        price: 500000,
      });
      expect(validItem.success).toBe(true);

      const emptyItems = invoiceCreateSchema.safeParse({
        clientId: "client_1",
        issueDate: "2026-11-01",
        dueDate: "2026-11-15",
        taxRate: 11,
        items: [],
      });
      expect(emptyItems.success).toBe(false);

      const validInvoice = invoiceCreateSchema.safeParse({
        clientId: "client_1",
        issueDate: "2026-11-01",
        dueDate: "2026-11-15",
        taxRate: 11,
        items: [{ description: "Dev", quantity: 1, price: 1000000 }],
      });
      expect(validInvoice.success).toBe(true);
    });
  });

  describe("Project & Milestone Schemas", () => {
    it("validates project and milestone schema constraints", () => {
      const validProj = projectCreateSchema.safeParse({
        title: "Enterprise AI Platform",
        description: "Comprehensive AI Automation and Router Relay Suite",
        clientId: "cuid_client_1",
        budget: "50000000",
      });
      expect(validProj.success).toBe(true);

      const invalidProj = projectCreateSchema.safeParse({
        title: "",
        description: "",
        clientId: "",
      });
      expect(invalidProj.success).toBe(false);

      const validMilestone = milestoneSchema.safeParse({
        title: "Sprint 1 MVP",
        status: "PENDING",
        dueDate: "2026-12-01",
      });
      expect(validMilestone.success).toBe(true);
    });
  });

  describe("Proposal & Signature Schemas", () => {
    it("validates proposal creation and signature", () => {
      const validProp = proposalCreateSchema.safeParse({
        title: "Proposal Solusi AI",
        content: "Dokumen proposal teknis sistem AI Relay",
        clientName: "PT Klien Hebat",
        clientEmail: "client@aldera.test",
        items: [{ description: "Audit", quantity: 1, price: 10000000 }],
      });
      expect(validProp.success).toBe(true);

      const validSig = signatureSchema.safeParse({
        signatureName: "John Doe",
        signatureDataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      });
      expect(validSig.success).toBe(true);

      const emptySig = signatureSchema.safeParse({
        signatureName: "",
        signatureDataUrl: "",
      });
      expect(emptySig.success).toBe(false);
    });
  });

  describe("Password Reset Schemas", () => {
    it("validates requestResetSchema email format", () => {
      expect(requestResetSchema.safeParse({ email: "user@aldera.test" }).success).toBe(true);
      expect(requestResetSchema.safeParse({ email: "invalid-email" }).success).toBe(false);
    });

    it("enforces password confirmation match in resetPasswordSchema", () => {
      const valid = resetPasswordSchema.safeParse({
        token: "valid_token_123",
        password: "NewPassword123!",
        confirmPassword: "NewPassword123!",
      });
      expect(valid.success).toBe(true);

      const mismatch = resetPasswordSchema.safeParse({
        token: "valid_token_123",
        password: "NewPassword123!",
        confirmPassword: "DifferentPassword123!",
      });
      expect(mismatch.success).toBe(false);
    });
  });

  describe("Recurring Invoice, Settings & Contact Schemas", () => {
    it("validates recurring invoice frequency options", () => {
      const valid = recurringInvoiceSchema.safeParse({
        name: "Monthly AI Retainer",
        clientId: "client_1",
        frequency: "MONTHLY",
        nextIssueDate: "2026-11-01",
        taxRate: 11,
        items: [{ description: "Monthly Retainer", quantity: 1, price: 15000000 }],
      });
      expect(valid.success).toBe(true);

      const invalidFreq = recurringInvoiceSchema.safeParse({
        name: "Retainer",
        clientId: "client_1",
        frequency: "DAILY", // not supported in enum
        nextIssueDate: "2026-11-01",
        items: [{ description: "Retainer", quantity: 1, price: 1000 }],
      });
      expect(invalidFreq.success).toBe(false);
    });

    it("validates site settings schema", () => {
      const valid = siteSettingsSchema.safeParse({
        brandName: "PT Aldera Solusi Teknologi",
        footerDescription: "Perusahaan IT Solution & AI Automation terpercaya di Indonesia.",
        responseTime: "Kurang dari 24 jam",
        seoTitle: "Aldera Tech — IT Solutions & AI Automation",
        seoDescription: "Penyedia layanan perangkat lunak, sistem AI relay, dan arsitektur enterprise.",
        email: "hello@aldera.tech",
        phone: "08123456789",
      });
      expect(valid.success).toBe(true);
    });

    it("validates contact form schema boundaries", () => {
      const valid = contactSchema.safeParse({
        name: "Budi Santoso",
        email: "budi@aldera.test",
        phone: "08123456789",
        subject: "Tanya AI Relay",
        message: "Saya tertarik dengan layanan AI Automation Aldera Tech.",
      });
      expect(valid.success).toBe(true);

      const tooShortMessage = contactSchema.safeParse({
        name: "Budi",
        email: "budi@aldera.test",
        phone: "08123456789",
        subject: "Tanya",
        message: "Hi", // below 10 chars
      });
      expect(tooShortMessage.success).toBe(false);
    });
  });
});
