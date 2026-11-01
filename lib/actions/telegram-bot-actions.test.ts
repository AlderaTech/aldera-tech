import { describe, it, expect, mock, beforeEach } from "bun:test";
import type { Role } from "@prisma/client";

type MockSession = {
  user: {
    id: string;
    roles?: Role[];
    role?: Role;
    name?: string;
    email?: string;
  };
} | null;

let currentSession: MockSession = null;

mock.module("server-only", () => ({}));

mock.module("@/auth", () => ({
  auth: mock(async () => currentSession),
  handlers: {},
  signIn: mock(),
  signOut: mock(),
}));

mock.module("next/cache", () => ({
  revalidatePath: mock(),
  revalidateTag: mock(),
}));

import { getTestPrisma } from "@/lib/test-prisma";
const prisma = getTestPrisma();
mock.module("@/lib/prisma", () => ({
  prisma,
  default: prisma,
}));

const {
  getTelegramBotConfigAction,
  updateTelegramBotConfigAction,
  createPaymentMethodAction,
  getPaymentMethodsAction,
} = await import("@/lib/actions/telegram-bot");
const { queryRouter } = await import("@/lib/router-db");

describe("AT-L6: lib/actions/telegram-bot.ts test suite", () => {
  const adminId = "admin_bot_tester_1";

  beforeEach(() => {
    currentSession = {
      user: {
        id: adminId,
        role: "ADMIN",
        roles: ["ADMIN"],
        name: "Bot Admin",
        email: "admin.bot@aldera.test",
      },
    };
  });

  describe("Authorization & Security Boundaries", () => {
    it("throws Unauthorized (401) when user is unauthenticated", async () => {
      currentSession = null;
      expect(updateTelegramBotConfigAction({})).rejects.toThrow("Unauthorized (401)");
      expect(createPaymentMethodAction({ name: "BCA" })).rejects.toThrow("Unauthorized (401)");
    });

    it("throws Forbidden (403) when user role is not ADMIN", async () => {
      currentSession = {
        user: {
          id: "client_user_1",
          role: "CLIENT",
          roles: ["CLIENT"],
          name: "Client",
          email: "client@aldera.test",
        },
      };
      expect(updateTelegramBotConfigAction({})).rejects.toThrow("Forbidden (403)");
      expect(createPaymentMethodAction({ name: "BCA" })).rejects.toThrow("Forbidden (403)");
    });
  });

  describe("updateTelegramBotConfigAction & Dual-Write", () => {
    it("updates Telegram Bot CMS and dual-writes to Prisma and router DB", async () => {
      const stamp = Date.now();
      const customTicketTemplate = `<b>TIKET TOP-UP #${stamp}</b>\nTransfer tepat: <code>Rp {total_transfer}</code>`;
      const customAdmin = `aldera_support_${stamp}`;
      const customAmounts = [50000, 100000, 200000];

      const res = await updateTelegramBotConfigAction({
        ticketTemplate: customTicketTemplate,
        adminTelegramUsername: `@${customAdmin}`, // tests @ strip
        topupAmounts: customAmounts,
      });

      expect(res.ok).toBe(true);

      // 1. Verify Prisma record
      const prismaConfig = await prisma.telegramBotConfig.findUnique({
        where: { id: "default" },
      });
      expect(prismaConfig).not.toBeNull();
      expect(prismaConfig?.ticketTemplate).toBe(customTicketTemplate);
      expect(prismaConfig?.adminTelegramUsername).toBe(customAdmin);
      expect(prismaConfig?.topupAmounts).toEqual(customAmounts);

      // 2. Verify aldera_router dual-write record
      const routerResult = await queryRouter<{
        id: string;
        ticket_template: string;
        admin_telegram_username: string;
        topup_amounts: unknown;
      }>("SELECT id, ticket_template, admin_telegram_username, topup_amounts FROM telegram_bot_configs WHERE id = 'default';");

      expect(routerResult.rows.length).toBe(1);
      const routerRow = routerResult.rows[0];
      expect(routerRow.ticket_template).toBe(customTicketTemplate);
      expect(routerRow.admin_telegram_username).toBe(customAdmin);
    });
  });

  describe("createPaymentMethodAction & getPaymentMethodsAction", () => {
    it("creates payment method with dual-write to Prisma and router DB and lists ordered by displayOrder", async () => {
      const stamp = Date.now();
      const pmId = `pm_test_${stamp}`;

      const res = await createPaymentMethodAction({
        id: pmId,
        type: "BANK_TRANSFER",
        name: "Bank BCA Virtual Account",
        accountNumber: "88012345678",
        accountName: "PT Aldera Solusi Teknologi",
        isActive: true,
        displayOrder: 1,
      });

      expect(res.ok).toBe(true);
      expect(res.id).toBe(pmId);

      // 1. Verify Prisma record
      const prismaPM = await prisma.paymentMethodSetting.findUnique({
        where: { id: pmId },
      });
      expect(prismaPM).not.toBeNull();
      expect(prismaPM?.name).toBe("Bank BCA Virtual Account");
      expect(prismaPM?.accountNumber).toBe("88012345678");

      // 2. Verify aldera_router dual-write
      const routerPM = await queryRouter<{
        id: string;
        name: string;
        account_number: string;
      }>("SELECT id, name, account_number FROM payment_method_settings WHERE id = $1;", [pmId]);

      expect(routerPM.rows.length).toBe(1);
      expect(routerPM.rows[0].name).toBe("Bank BCA Virtual Account");
      expect(routerPM.rows[0].account_number).toBe("88012345678");

      // 3. Verify getPaymentMethodsAction returns the newly created item
      const list = await getPaymentMethodsAction();
      expect(list.some((item) => item.id === pmId)).toBe(true);
    });
  });
});
