import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { PaymentMethodItem } from "@/lib/actions/telegram-bot";

mock.module("server-only", () => ({}));

let currentSearchParams = new URLSearchParams();

const redirect = mock((path: string): never => {
  throw new Error(`redirect:${path}`);
});
const notFound = mock((): never => {
  throw new Error("notFound");
});

mock.module("next/navigation", () => ({
  redirect,
  notFound,
  useRouter: () => ({ replace: mock(), push: mock(), refresh: mock() }),
  usePathname: () => "/admin/telegram-bot",
  useSearchParams: () => currentSearchParams,
}));

mock.module("@/lib/actions/telegram-bot", () => ({
  updateTelegramBotConfigAction: mock(),
  createPaymentMethodAction: mock(),
  updatePaymentMethodAction: mock(),
  togglePaymentMethodAction: mock(),
  deletePaymentMethodAction: mock(),
}));

const { TelegramBotAdminClientView } = await import("./client-view");

const mockConfig = {
  id: "cfg-1",
  ticketTemplate: "Template tiket top-up",
  importantNotes: "Catatan penting unik",
  nextStepsNotes: "Langkah berikutnya struk",
  topupAmounts: [50000, 100000, 250000],
  adminTelegramUsername: "aldera_admin",
  welcomeText: "Selamat datang",
  helpText: "Bantuan",
};

const mockPaymentMethods: PaymentMethodItem[] = [
  {
    id: "pm-1",
    type: "BANK_TRANSFER",
    name: "BCA Transfer",
    accountNumber: "1234567890",
    accountName: "PT Aldera",
    qrisImageUrl: null,
    instructions: "Transfer ke BCA",
    displayOrder: 1,
    isActive: true,
  },
];

describe("TelegramBotAdminClientView UI Component", () => {
  it("renders both tab triggers: bot-cms and payment-methods", () => {
    currentSearchParams = new URLSearchParams();
    const html = renderToStaticMarkup(
      <TelegramBotAdminClientView
        initialConfig={mockConfig}
        initialPaymentMethods={mockPaymentMethods}
      />
    );

    expect(html).toContain("Template Pesan Bot");
    expect(html).toContain("Metode Pembayaran");
  });

  it("activates bot-cms tab by default when no ?tab= query param is provided", () => {
    currentSearchParams = new URLSearchParams();
    const html = renderToStaticMarkup(
      <TelegramBotAdminClientView
        initialConfig={mockConfig}
        initialPaymentMethods={mockPaymentMethods}
      />
    );

    expect(html).toContain('data-state="active"');
    expect(html).toContain("Username Kontak Admin Telegram");
    expect(html).toContain("Nominal Tombol Top-Up Saldo");
  });

  it("activates payment-methods tab when ?tab=payment-methods is in the URL", () => {
    currentSearchParams = new URLSearchParams("tab=payment-methods");
    const html = renderToStaticMarkup(
      <TelegramBotAdminClientView
        initialConfig={mockConfig}
        initialPaymentMethods={mockPaymentMethods}
      />
    );

    expect(html).toContain('data-state="active"');
    expect(html).toContain("Daftar Metode Pembayaran Aktif");
    expect(html).toContain("BCA Transfer");
  });

  it("falls back to bot-cms tab when an invalid ?tab= parameter is supplied", () => {
    currentSearchParams = new URLSearchParams("tab=invalid-tab");
    const html = renderToStaticMarkup(
      <TelegramBotAdminClientView
        initialConfig={mockConfig}
        initialPaymentMethods={mockPaymentMethods}
      />
    );

    expect(html).toContain('data-state="active"');
    expect(html).toContain("Username Kontak Admin Telegram");
  });
});
