import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { clientNavConfig } from "@/lib/dashboard-nav";
import { AUTH_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import { OverviewShell } from "./_components/overview-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user)
    redirect(AUTH_ROUTES.loginWithCallback(DASHBOARD_ROUTES.home));

  return (
    <OverviewShell>
      <div
        data-overview-sidebar
        className="sticky top-0 hidden h-svh w-72 shrink-0 lg:flex"
      >
        <DashboardSidebar
          groups={clientNavConfig.groups}
          footerItem={clientNavConfig.footerItem}
          variant={clientNavConfig.variant}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader session={session} navConfig={clientNavConfig} />
        <main
          data-overview-content
          className="mx-auto w-full max-w-screen-xxxl flex-1 container-px py-5"
        >
          {children}
        </main>
      </div>
    </OverviewShell>
  );
}
