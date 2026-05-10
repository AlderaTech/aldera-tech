import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { getAdminNavConfig } from "@/lib/dashboard-nav";
import { isStaff } from "@/lib/permissions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (!isStaff(session.user.role)) redirect("/dashboard");

  const navConfig = getAdminNavConfig(session.user.role);

  return (
    <div className="flex min-h-svh bg-slate-50">
      <div className="sticky top-0 hidden h-svh w-72 shrink-0 lg:flex">
        <DashboardSidebar
          groups={navConfig.groups}
          footerItem={navConfig.footerItem}
          variant={navConfig.variant}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader session={session} navConfig={navConfig} />
        <main className="container-px mx-auto w-full max-w-screen-xxxl flex-1 py-5">
          {children}
        </main>
      </div>
    </div>
  );
}
