import { AdminBanner } from "@/app/admin/_components/admin-banner";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { auth } from "@/auth";
import { hasPermission, isStaff, PERMISSIONS } from "@/lib/permissions";
import { AUTH_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import { AdminMascot } from "../_components/admin-mascot";
import { InviteUserDialog } from "./_components/invite-user-dialog";
import { UserRoleTabs } from "./_components/user-role-tabs";
import { UserTable } from "./_components/user-table";
import { TeamWorkloadGrid } from "./_components/team-workload-grid";
import { getUsersAndWorkloadData } from "./_data/get-users-and-workload";

type AdminUsersPageProps = {
  searchParams: Promise<{ role?: string; view?: string }>;
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const session = await auth();
  const userRoles =
    session?.user?.roles ?? (session?.user?.role ? [session.user.role] : []);

  if (!session?.user || !isStaff(userRoles)) {
    redirect(session?.user ? DASHBOARD_ROUTES.home : AUTH_ROUTES.login);
  }

  const canManageUsers = hasPermission(userRoles, PERMISSIONS.USER_MANAGE);
  const params = await searchParams;

  // Unprivileged staff (e.g. Developer without USER_MANAGE) are restricted to DEVELOPER workload view
  const requestedRole = (params.role || "").toUpperCase();
  const validRoles = ["ALL", "ADMIN", "DEVELOPER", "CLIENT"];
  let activeRole = validRoles.includes(requestedRole) ? requestedRole : "ALL";

  if (!canManageUsers) {
    activeRole = "DEVELOPER";
  }

  const activeView =
    activeRole === "DEVELOPER"
      ? params.view === "table"
        ? "table"
        : "workload"
      : "table";

  const { users, staffWorkload, counts } = await getUsersAndWorkloadData();

  const filteredUsers =
    activeRole === "ALL"
      ? users
      : users.filter((u) =>
          u.roles.includes(activeRole as "ADMIN" | "DEVELOPER" | "CLIENT")
        );

  return (
    <div className="space-y-6">
      <AdminBanner
        data-admin-page-header
        className="flex flex-wrap items-center justify-between gap-4"
        category="users"
        mascot={<AdminMascot pose="users" size="header" />}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengguna & Tim</h1>
          <p className="text-sm text-muted-foreground">
            Kelola akun pengguna, peran akses, dan pantau kapasitas beban kerja
            tim.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canManageUsers && (
            <InviteUserDialog>
              <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90">
                <UserPlus className="size-4" /> Invite User
              </button>
            </InviteUserDialog>
          )}
        </div>
      </AdminBanner>

      <UserRoleTabs
        activeRole={activeRole}
        activeView={activeView}
        counts={counts}
        canManageUsers={canManageUsers}
      />

      {activeRole === "DEVELOPER" && activeView === "workload" ? (
        <TeamWorkloadGrid staff={staffWorkload} />
      ) : (
        <UserTable users={filteredUsers} canManageUsers={canManageUsers} />
      )}
    </div>
  );
}
