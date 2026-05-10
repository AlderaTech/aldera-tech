import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
  DashboardSidebar,
  clientNavItems,
} from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");

  return (
    <div className="min-h-svh bg-muted/20 flex">
      <div className="hidden lg:flex w-64 xxxl:w-72 shrink-0 sticky top-0 h-svh">
        <DashboardSidebar items={clientNavItems} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader session={session} navItems={clientNavItems} />
        <main className="flex-1 container-px py-6 max-w-screen-xxxl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
