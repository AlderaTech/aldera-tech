import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isStaff } from "@/lib/permissions";
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user) {
    const roles =
      session.user.roles ?? (session.user.role ? [session.user.role] : []);
    redirect(
      isStaff(roles) ? ADMIN_ROUTES.home : DASHBOARD_ROUTES.home
    );
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(0,177,225,0.10),transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(15,38,58,0.06),transparent_50%)]" />
      <div className="relative mx-auto flex w-full max-w-[1080px] items-center justify-center">
        {children}
      </div>
    </main>
  );
}
