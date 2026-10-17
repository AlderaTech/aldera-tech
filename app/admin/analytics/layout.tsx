import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasPermission, isStaff, PERMISSIONS } from "@/lib/permissions";
import { ADMIN_ROUTES, AUTH_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";

export default async function AdminAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect(AUTH_ROUTES.loginWithCallback(ADMIN_ROUTES.analytics));
  }

  const roles =
    session.user.roles ?? (session.user.role ? [session.user.role] : []);

  if (!hasPermission(roles, PERMISSIONS.ANALYTICS_VIEW)) {
    if (isStaff(roles)) {
      redirect(ADMIN_ROUTES.home);
    }
    redirect(DASHBOARD_ROUTES.home);
  }

  return <>{children}</>;
}
