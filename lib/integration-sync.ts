import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { transactionRouter } from "@/lib/router-db";

type SettingsArea = `payment-method:${string}` | "telegram-config";
export async function queueIntegrationSync(
  tx: Prisma.TransactionClient,
  id: SettingsArea
) {
  await tx.integrationSyncState.upsert({
    where: { id },
    create: { id },
    update: { revision: { increment: 1 } },
  });
}

export async function syncIntegrationSettings(id: SettingsArea) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "IntegrationSyncState" WHERE "id" = ${id} FOR UPDATE`;
      const state = await tx.integrationSyncState.findUnique({ where: { id } });
      if (!state || state.appliedRevision === state.revision) return;
      await transactionRouter(async (router) => {
        if (id.startsWith("payment-method:")) {
          const methodId = id.slice("payment-method:".length);
          const item = await tx.paymentMethodSetting.findUnique({
            where: { id: methodId },
          });
          if (!item)
            await router.query(
              "DELETE FROM payment_method_settings WHERE id = $1",
              [methodId]
            );
          if (item)
            await router.query(
              `INSERT INTO payment_method_settings (id, type, name, account_number, account_name, qris_image_url, instructions, is_active, display_order, created_at, updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW()) ON CONFLICT (id) DO UPDATE SET type=EXCLUDED.type, name=EXCLUDED.name,
             account_number=EXCLUDED.account_number, account_name=EXCLUDED.account_name, qris_image_url=EXCLUDED.qris_image_url,
             instructions=EXCLUDED.instructions, is_active=EXCLUDED.is_active, display_order=EXCLUDED.display_order, updated_at=NOW()`,
              [
                item.id,
                item.type,
                item.name,
                item.accountNumber,
                item.accountName,
                item.qrisImageUrl,
                item.instructions,
                item.isActive,
                item.displayOrder,
              ]
            );
        } else {
          const item = await tx.telegramBotConfig.findUniqueOrThrow({
            where: { id: "default" },
          });
          await router.query(
            `INSERT INTO telegram_bot_configs (id,ticket_template,important_notes,next_steps_notes,topup_amounts,admin_telegram_username,welcome_text,help_text,updated_at)
            VALUES ('default',$1,$2,$3,$4::jsonb,$5,$6,$7,NOW()) ON CONFLICT (id) DO UPDATE SET ticket_template=EXCLUDED.ticket_template,
            important_notes=EXCLUDED.important_notes,next_steps_notes=EXCLUDED.next_steps_notes,topup_amounts=EXCLUDED.topup_amounts,
            admin_telegram_username=EXCLUDED.admin_telegram_username,welcome_text=EXCLUDED.welcome_text,help_text=EXCLUDED.help_text,updated_at=NOW()`,
            [
              item.ticketTemplate,
              item.importantNotes,
              item.nextStepsNotes,
              JSON.stringify(item.topupAmounts),
              item.adminTelegramUsername,
              item.welcomeText,
              item.helpText,
            ]
          );
        }
      });
      await tx.integrationSyncState.update({
        where: { id },
        data: { appliedRevision: state.revision, lastError: null },
      });
    });
  } catch {
    await prisma.integrationSyncState.update({
      where: { id },
      data: { lastError: "Sinkronisasi router tertunda." },
    });
    throw new Error(
      "Data utama tersimpan, tetapi sinkronisasi bot tertunda. Sistem akan mencoba ulang; jangan menganggap konfigurasi bot sudah berubah."
    );
  }
}

export async function retryIntegrationSettings() {
  const states = await prisma.integrationSyncState.findMany({
    where: {
      revision: { gt: prisma.integrationSyncState.fields.appliedRevision },
    },
    orderBy: { updatedAt: "asc" },
    take: 100,
  });
  for (const state of states)
    if (
      state.id === "telegram-config" ||
      state.id.startsWith("payment-method:")
    )
      await syncIntegrationSettings(state.id as SettingsArea);
}
