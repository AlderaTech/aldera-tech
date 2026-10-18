import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/permissions";
import { ADMIN_ROUTES } from "@/lib/routes";
import {
  getTelegramBotConfigAction,
  getPaymentMethodsAction,
} from "@/lib/actions/telegram-bot";
import { TelegramBotAdminClientView } from "./client-view";

export const metadata = {
  title: "Pengaturan Bot Telegram & Pembayaran — Aldera Tech",
  description:
    "CMS template bot Telegram, kontak konfirmasi admin, tombol nominal top-up, dan pengelolaan metode pembayaran dinamis.",
};

export default async function AdminTelegramBotPage() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.roles ?? session.user.role)) {
    redirect(ADMIN_ROUTES.home);
  }

  const [botConfig, paymentMethods] = await Promise.all([
    getTelegramBotConfigAction(),
    getPaymentMethodsAction(),
  ]);

  return (
    <TelegramBotAdminClientView
      initialConfig={botConfig}
      initialPaymentMethods={paymentMethods}
    />
  );
}
