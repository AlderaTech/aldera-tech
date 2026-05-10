import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user) {
    redirect(
      session.user.role === "ADMIN" ? ADMIN_ROUTES.home : DASHBOARD_ROUTES.home
    );
  }

  return (
    <main className="editorial-surface relative h-dvh overflow-y-auto px-4 py-4 sm:px-6 lg:overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_18%_12%,rgba(11,107,255,0.18),transparent_34%),radial-gradient(circle_at_82%_4%,rgba(8,9,13,0.10),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-full w-full max-w-[1120px] items-center">
        {children}
      </div>
    </main>
  );
}
