"use server";

import crypto from "crypto";
import {
  queueIntegrationSync,
  syncIntegrationSettings,
} from "@/lib/integration-sync";
import { paymentMethodInputSchema } from "@/lib/validations/bot-settings";
import { ADMIN_ROUTES } from "@/lib/routes";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { queryRouter } from "@/lib/router-db";
import { convertTipTapToTelegramHtml } from "@/lib/telegram-html";

// Default template configuration
const DEFAULT_BOT_CONFIG = {
  id: "default",
  ticketTemplate:
    "💳 <b>TIKET TOP-UP #{ticket_id}</b>\n\nNominal: <b>Rp {total_transfer}</b>",
  importantNotes:
    "⚠️ <b>PENTING:</b> Mohon transfer TEPAT sejumlah <code>Rp {total_transfer}</code> (hingga 3 digit terakhir) agar verifikasi manual berjalan lancar.",
  nextStepsNotes:
    "📸 <b>LANGKAH SELANJUTNYA:</b> Setelah transfer, silakan kirimkan foto bukti transfer ke bot ini.",
  topupAmounts: [25000, 50000, 100000, 250000, 500000],
  adminTelegramUsername: "aldera_admin",
  welcomeText: null as string | null,
  helpText: null as string | null,
};

export interface UpdateTelegramBotConfigInput {
  ticketTemplate?: string;
  importantNotes?: string;
  nextStepsNotes?: string;
  topupAmounts?: number[] | string;
  adminTelegramUsername?: string;
  welcomeText?: string | null;
  helpText?: string | null;
}

export interface PaymentMethodItem {
  id: string;
  type: string;
  name: string;
  accountNumber: string;
  accountName: string;
  qrisImageUrl?: string | null;
  instructions?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePaymentMethodInput {
  id?: string;
  type?: string;
  name: string;
  accountNumber?: string;
  accountName?: string;
  qrisImageUrl?: string | null;
  instructions?: string | null;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UpdatePaymentMethodInput {
  type?: string;
  name?: string;
  accountNumber?: string;
  accountName?: string;
  qrisImageUrl?: string | null;
  instructions?: string | null;
  isActive?: boolean;
  displayOrder?: number;
}

/**
 * Enforces authentication (401) and ADMIN authorization (403).
 */
async function requireAdminAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error(
      "Unauthorized (401): Sesi tidak valid atau telah berakhir."
    );
  }

  const roles =
    session.user.roles ?? (session.user.role ? [session.user.role] : []);
  if (!isAdmin(roles)) {
    throw new Error("Forbidden (403): Aksi ini membutuhkan hak akses ADMIN.");
  }

  return session;
}

/**
 * Fetches the current Telegram Bot CMS configuration with fallback defaults.
 */
export async function getTelegramBotConfigAction() {
  try {
    const config = await prisma.telegramBotConfig.findUnique({
      where: { id: "default" },
    });

    if (config) {
      return {
        id: config.id,
        ticketTemplate: config.ticketTemplate,
        importantNotes: config.importantNotes,
        nextStepsNotes: config.nextStepsNotes,
        topupAmounts: Array.isArray(config.topupAmounts)
          ? (config.topupAmounts as number[])
          : typeof config.topupAmounts === "string"
            ? (JSON.parse(config.topupAmounts) as number[])
            : DEFAULT_BOT_CONFIG.topupAmounts,
        adminTelegramUsername: config.adminTelegramUsername,
        welcomeText: config.welcomeText,
        helpText: config.helpText,
      };
    }
  } catch (err) {
    console.warn("[getTelegramBotConfigAction] Prisma read fallback:", err);
  }

  // Fallback to router database
  try {
    const res = await queryRouter<{
      id: string;
      ticket_template: string;
      important_notes: string;
      next_steps_notes: string;
      topup_amounts: unknown;
      admin_telegram_username: string;
      welcome_text: string | null;
      help_text: string | null;
    }>(
      `SELECT id, ticket_template, important_notes, next_steps_notes, topup_amounts, admin_telegram_username, welcome_text, help_text
       FROM telegram_bot_configs
       WHERE id = 'default'
       LIMIT 1;`
    );

    if (res.rows.length > 0) {
      const row = res.rows[0];
      const amounts = Array.isArray(row.topup_amounts)
        ? (row.topup_amounts as number[])
        : typeof row.topup_amounts === "string"
          ? (JSON.parse(row.topup_amounts) as number[])
          : DEFAULT_BOT_CONFIG.topupAmounts;

      return {
        id: row.id,
        ticketTemplate: row.ticket_template,
        importantNotes: row.important_notes,
        nextStepsNotes: row.next_steps_notes,
        topupAmounts: amounts,
        adminTelegramUsername: row.admin_telegram_username,
        welcomeText: row.welcome_text,
        helpText: row.help_text,
      };
    }
  } catch (err) {
    console.warn("[getTelegramBotConfigAction] Router DB read fallback:", err);
  }

  return DEFAULT_BOT_CONFIG;
}

/**
 * Updates Telegram Bot CMS configuration in Prisma and synchronizes to aldera_router.
 */
export async function updateTelegramBotConfigAction(
  data: UpdateTelegramBotConfigInput
) {
  await requireAdminAuth();

  const current = await getTelegramBotConfigAction();

  const finalTicketTemplate =
    data.ticketTemplate !== undefined
      ? convertTipTapToTelegramHtml(data.ticketTemplate)
      : current.ticketTemplate;

  const finalImportantNotes =
    data.importantNotes !== undefined
      ? convertTipTapToTelegramHtml(data.importantNotes)
      : current.importantNotes;

  const finalNextStepsNotes =
    data.nextStepsNotes !== undefined
      ? convertTipTapToTelegramHtml(data.nextStepsNotes)
      : current.nextStepsNotes;

  let finalTopupAmounts: number[] = current.topupAmounts;
  if (data.topupAmounts !== undefined) {
    if (Array.isArray(data.topupAmounts)) {
      finalTopupAmounts = data.topupAmounts
        .map(Number)
        .filter((n) => !isNaN(n) && n > 0);
    } else if (typeof data.topupAmounts === "string") {
      try {
        const parsed = JSON.parse(data.topupAmounts);
        if (Array.isArray(parsed)) {
          finalTopupAmounts = parsed
            .map(Number)
            .filter((n) => !isNaN(n) && n > 0);
        }
      } catch {
        // ignore parse error
      }
    }
  }

  const finalAdminUsername =
    data.adminTelegramUsername !== undefined
      ? data.adminTelegramUsername.replace(/^@/, "").trim()
      : current.adminTelegramUsername;

  const updatedPrisma = await prisma.$transaction(async (tx) => {
    const result = await tx.telegramBotConfig.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        ticketTemplate: finalTicketTemplate,
        importantNotes: finalImportantNotes,
        nextStepsNotes: finalNextStepsNotes,
        topupAmounts: finalTopupAmounts,
        adminTelegramUsername: finalAdminUsername,
        welcomeText: data.welcomeText ?? current.welcomeText,
        helpText: data.helpText ?? current.helpText,
      },
      update: {
        ...(data.ticketTemplate !== undefined
          ? { ticketTemplate: finalTicketTemplate }
          : {}),
        ...(data.importantNotes !== undefined
          ? { importantNotes: finalImportantNotes }
          : {}),
        ...(data.nextStepsNotes !== undefined
          ? { nextStepsNotes: finalNextStepsNotes }
          : {}),
        ...(data.topupAmounts !== undefined
          ? { topupAmounts: finalTopupAmounts }
          : {}),
        ...(data.adminTelegramUsername !== undefined
          ? { adminTelegramUsername: finalAdminUsername }
          : {}),
        ...(data.welcomeText !== undefined
          ? { welcomeText: data.welcomeText }
          : {}),
        ...(data.helpText !== undefined ? { helpText: data.helpText } : {}),
      },
    });
    await queueIntegrationSync(tx, "telegram-config");
    return result;
  });
  await syncIntegrationSettings("telegram-config");
  try {
    revalidatePath(ADMIN_ROUTES.telegramBot);
  } catch {
    // ignore outside Next.js request context
  }

  return { ok: true, data: updatedPrisma };
}

/**
 * Lists all payment methods ordered by displayOrder ASC.
 */
export async function getPaymentMethodsAction(): Promise<PaymentMethodItem[]> {
  return prisma.paymentMethodSetting.findMany({
    orderBy: { displayOrder: "asc" },
  });
}

/**
 * Creates a new payment method in Prisma and aldera_router.
 */
export async function createPaymentMethodAction(
  data: CreatePaymentMethodInput
) {
  await requireAdminAuth();
  const parsed = paymentMethodInputSchema.parse(data);
  const id = parsed.id ?? crypto.randomUUID();
  await prisma.$transaction(async (tx) => {
    await tx.paymentMethodSetting.create({
      data: {
        ...parsed,
        id,
        type: parsed.type ?? "BANK_TRANSFER",
        accountNumber: parsed.accountNumber ?? "",
        accountName: parsed.accountName ?? "",
      },
    });
    await queueIntegrationSync(tx, `payment-method:${id}`);
  });
  await syncIntegrationSettings(`payment-method:${id}`);
  revalidatePath(ADMIN_ROUTES.telegramBot);
  return { ok: true, id };
}

/**
 * Updates an existing payment method in Prisma and aldera_router.
 */
export async function updatePaymentMethodAction(
  id: string,
  data: UpdatePaymentMethodInput
) {
  await requireAdminAuth();
  const parsed = paymentMethodInputSchema.partial().parse(data);
  await prisma.$transaction(async (tx) => {
    await tx.paymentMethodSetting.update({ where: { id }, data: parsed });
    await queueIntegrationSync(tx, `payment-method:${id}`);
  });
  await syncIntegrationSettings(`payment-method:${id}`);
  revalidatePath(ADMIN_ROUTES.telegramBot);
  return { ok: true };
}

/**
 * Toggles the isActive status of a payment method in Prisma and aldera_router.
 */
export async function togglePaymentMethodAction(id: string, isActive: boolean) {
  await requireAdminAuth();
  if (typeof isActive !== "boolean") throw new Error("Status tidak valid.");
  await prisma.$transaction(async (tx) => {
    await tx.paymentMethodSetting.update({ where: { id }, data: { isActive } });
    await queueIntegrationSync(tx, `payment-method:${id}`);
  });
  await syncIntegrationSettings(`payment-method:${id}`);
  revalidatePath(ADMIN_ROUTES.telegramBot);
  return { ok: true };
}

/**
 * Deletes a payment method from Prisma and aldera_router.
 */
export async function deletePaymentMethodAction(id: string) {
  await requireAdminAuth();
  await prisma.$transaction(async (tx) => {
    await tx.paymentMethodSetting.delete({ where: { id } });
    await queueIntegrationSync(tx, `payment-method:${id}`);
  });
  await syncIntegrationSettings(`payment-method:${id}`);
  revalidatePath(ADMIN_ROUTES.telegramBot);
  return { ok: true };
}
