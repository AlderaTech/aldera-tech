import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin, isStaff } from "@/lib/permissions";
import { ADMIN_ROUTES, AUTH_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";

export const metadata = {
  title: "AI Relay Operations — Admin Portal Aldera Tech",
  description:
    "Manajemen katalog model, pricing dinamis, sinkronisasi 9router, approval top-up, dan audit ledger.",
};

export default async function AdminAiRelayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect(AUTH_ROUTES.loginWithCallback(ADMIN_ROUTES.aiRelay));
  }

  const roles =
    session.user.roles ?? (session.user.role ? [session.user.role] : []);

  if (!isAdmin(roles)) {
    if (isStaff(roles)) {
      redirect(ADMIN_ROUTES.home);
    }
    redirect(DASHBOARD_ROUTES.home);
  }

  return <>{children}</>;
}
