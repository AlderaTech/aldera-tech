import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { clientNavConfig } from "@/lib/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  return (
    <div className="flex min-h-svh bg-slate-50">
      <div className="sticky top-0 hidden h-svh w-72 shrink-0 lg:flex">
        <DashboardSidebar
          groups={clientNavConfig.groups}
          footerItem={clientNavConfig.footerItem}
          variant={clientNavConfig.variant}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader session={session} navConfig={clientNavConfig} />
        <main className="container-px mx-auto w-full max-w-screen-xxxl flex-1 py-5">
          {children}
        </main>
      </div>
    </div>
  );
}
