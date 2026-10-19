"use server";

import crypto from "crypto";
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

  // 1. Upsert in Prisma
  let updatedPrisma: unknown = null;
  try {
    updatedPrisma = await prisma.telegramBotConfig.upsert({
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
  } catch (err) {
    console.warn("[updateTelegramBotConfigAction] Prisma upsert error:", err);
  }

  // 2. Synchronize to aldera_router
  const amountsJson = JSON.stringify(finalTopupAmounts);
  await queryRouter(
    `INSERT INTO telegram_bot_configs (
       id, ticket_template, important_notes, next_steps_notes, topup_amounts, admin_telegram_username, welcome_text, help_text, updated_at
     ) VALUES ('default', $1, $2, $3, $4::jsonb, $5, $6, $7, NOW())
     ON CONFLICT (id) DO UPDATE SET
       ticket_template = EXCLUDED.ticket_template,
       important_notes = EXCLUDED.important_notes,
       next_steps_notes = EXCLUDED.next_steps_notes,
       topup_amounts = EXCLUDED.topup_amounts,
       admin_telegram_username = EXCLUDED.admin_telegram_username,
       welcome_text = EXCLUDED.welcome_text,
       help_text = EXCLUDED.help_text,
       updated_at = NOW();`,
    [
      finalTicketTemplate,
      finalImportantNotes,
      finalNextStepsNotes,
      amountsJson,
      finalAdminUsername,
      data.welcomeText ?? current.welcomeText ?? null,
      data.helpText ?? current.helpText ?? null,
    ]
  );

  try {
    revalidatePath("/admin/telegram-bot");
  } catch {
    // ignore outside Next.js request context
  }

  return { ok: true, data: updatedPrisma };
}

/**
 * Lists all payment methods ordered by displayOrder ASC.
 */
export async function getPaymentMethodsAction(): Promise<PaymentMethodItem[]> {
  try {
    const list = await prisma.paymentMethodSetting.findMany({
      orderBy: { displayOrder: "asc" },
    });

    if (list.length > 0) {
      return list.map((item) => ({
        id: item.id,
        type: item.type,
        name: item.name,
        accountNumber: item.accountNumber,
        accountName: item.accountName,
        qrisImageUrl: item.qrisImageUrl,
        instructions: item.instructions,
        isActive: item.isActive,
        displayOrder: item.displayOrder,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));
    }
  } catch (err) {
    console.warn("[getPaymentMethodsAction] Prisma read error:", err);
  }

  // Fallback to aldera_router
  try {
    const res = await queryRouter<{
      id: string;
      type: string;
      name: string;
      account_number: string;
      account_name: string;
      qris_image_url: string | null;
      instructions: string | null;
      is_active: boolean;
      display_order: number;
      created_at: string | Date;
      updated_at: string | Date;
    }>(
      `SELECT id, type, name, account_number, account_name, qris_image_url, instructions, is_active, display_order, created_at, updated_at
       FROM payment_method_settings
       ORDER BY display_order ASC;`
    );

    return res.rows.map((r) => ({
      id: r.id,
      type: r.type,
      name: r.name,
      accountNumber: r.account_number,
      accountName: r.account_name,
      qrisImageUrl: r.qris_image_url,
      instructions: r.instructions,
      isActive: r.is_active,
      displayOrder: r.display_order,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at),
    }));
  } catch (err) {
    console.warn("[getPaymentMethodsAction] Router DB read error:", err);
  }

  return [];
}

/**
 * Creates a new payment method in Prisma and aldera_router.
 */
export async function createPaymentMethodAction(
  data: CreatePaymentMethodInput
) {
  await requireAdminAuth();

  if (!data.name || !data.name.trim()) {
    throw new Error("Nama metode pembayaran wajib diisi.");
  }

  const id =
    data.id || `pm_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const type = data.type || "BANK_TRANSFER";
  const name = data.name.trim();
  const accountNumber = data.accountNumber?.trim() ?? "";
  const accountName = data.accountName?.trim() ?? "";
  const qrisImageUrl = data.qrisImageUrl?.trim() || null;
  const instructions = data.instructions?.trim() || null;
  const isActive = data.isActive ?? true;
  const displayOrder = Number(data.displayOrder) || 0;

  // 1. Prisma insert
  try {
    await prisma.paymentMethodSetting.create({
      data: {
        id,
        type,
        name,
        accountNumber,
        accountName,
        qrisImageUrl,
        instructions,
        isActive,
        displayOrder,
      },
    });
  } catch (err) {
    console.warn("[createPaymentMethodAction] Prisma create warning:", err);
  }

  // 2. aldera_router insert
  await queryRouter(
    `INSERT INTO payment_method_settings (
       id, type, name, account_number, account_name, qris_image_url, instructions, is_active, display_order, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
     ON CONFLICT (id) DO UPDATE SET
       type = EXCLUDED.type,
       name = EXCLUDED.name,
       account_number = EXCLUDED.account_number,
       account_name = EXCLUDED.account_name,
       qris_image_url = EXCLUDED.qris_image_url,
       instructions = EXCLUDED.instructions,
       is_active = EXCLUDED.is_active,
       display_order = EXCLUDED.display_order,
       updated_at = NOW();`,
    [
      id,
      type,
      name,
      accountNumber,
      accountName,
      qrisImageUrl,
      instructions,
      isActive,
      displayOrder,
    ]
  );

  try {
    revalidatePath("/admin/telegram-bot");
  } catch {
    // ignore
  }

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

  // 1. Prisma update
  try {
    await prisma.paymentMethodSetting.update({
      where: { id },
      data: {
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.accountNumber !== undefined
          ? { accountNumber: data.accountNumber }
          : {}),
        ...(data.accountName !== undefined
          ? { accountName: data.accountName }
          : {}),
        ...(data.qrisImageUrl !== undefined
          ? { qrisImageUrl: data.qrisImageUrl }
          : {}),
        ...(data.instructions !== undefined
          ? { instructions: data.instructions }
          : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        ...(data.displayOrder !== undefined
          ? { displayOrder: data.displayOrder }
          : {}),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[updatePaymentMethodAction] Prisma update warning:", msg);
  }

  // 2. aldera_router update
  const updates: string[] = ["updated_at = NOW()"];
  const params: unknown[] = [id];
  let idx = 2;

  if (data.type !== undefined) {
    updates.push(`type = $${idx++}`);
    params.push(data.type);
  }
  if (data.name !== undefined) {
    updates.push(`name = $${idx++}`);
    params.push(data.name);
  }
  if (data.accountNumber !== undefined) {
    updates.push(`account_number = $${idx++}`);
    params.push(data.accountNumber);
  }
  if (data.accountName !== undefined) {
    updates.push(`account_name = $${idx++}`);
    params.push(data.accountName);
  }
  if (data.qrisImageUrl !== undefined) {
    updates.push(`qris_image_url = $${idx++}`);
    params.push(data.qrisImageUrl);
  }
  if (data.instructions !== undefined) {
    updates.push(`instructions = $${idx++}`);
    params.push(data.instructions);
  }
  if (data.isActive !== undefined) {
    updates.push(`is_active = $${idx++}`);
    params.push(data.isActive);
  }
  if (data.displayOrder !== undefined) {
    updates.push(`display_order = $${idx++}`);
    params.push(data.displayOrder);
  }

  await queryRouter(
    `UPDATE payment_method_settings SET ${updates.join(", ")} WHERE id = $1;`,
    params
  );

  try {
    revalidatePath("/admin/telegram-bot");
  } catch {
    // ignore
  }

  return { ok: true };
}

/**
 * Toggles the isActive status of a payment method in Prisma and aldera_router.
 */
export async function togglePaymentMethodAction(id: string, isActive: boolean) {
  await requireAdminAuth();

  // 1. Prisma update
  try {
    await prisma.paymentMethodSetting.update({
      where: { id },
      data: { isActive },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[togglePaymentMethodAction] Prisma update warning:", msg);
  }

  // 2. aldera_router update
  await queryRouter(
    `UPDATE payment_method_settings SET is_active = $1, updated_at = NOW() WHERE id = $2;`,
    [isActive, id]
  );

  try {
    revalidatePath("/admin/telegram-bot");
  } catch {
    // ignore
  }

  return { ok: true };
}

/**
 * Deletes a payment method from Prisma and aldera_router.
 */
export async function deletePaymentMethodAction(id: string) {
  await requireAdminAuth();

  // 1. Prisma delete
  try {
    await prisma.paymentMethodSetting.delete({
      where: { id },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[deletePaymentMethodAction] Prisma delete warning:", msg);
  }

  // 2. aldera_router delete
  await queryRouter(`DELETE FROM payment_method_settings WHERE id = $1;`, [id]);

  try {
    revalidatePath("/admin/telegram-bot");
  } catch {
    // ignore
  }

  return { ok: true };
}
