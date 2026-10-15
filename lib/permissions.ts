import type { Role } from "@prisma/client";

/**
 * Roles that have access to /admin (non-client roles).
 * CLIENT is the only public-facing role; everyone else has admin access
 * with varying permission levels (see ROLE_PERMISSIONS).
 */
export const STAFF_ROLES = [
  "ADMIN",
  "DEVELOPER",
] as const satisfies readonly Role[];

export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaff(
  roleOrRoles: Role | readonly Role[] | null | undefined
): boolean {
  if (!roleOrRoles) return false;
  if (typeof roleOrRoles === "string") {
    return (STAFF_ROLES as readonly Role[]).includes(roleOrRoles);
  }
  if (!Array.isArray(roleOrRoles)) return false;
  return roleOrRoles.some((r) => (STAFF_ROLES as readonly Role[]).includes(r));
}

export function isAdmin(
  roleOrRoles: Role | readonly Role[] | null | undefined
): boolean {
  if (!roleOrRoles) return false;
  if (typeof roleOrRoles === "string") {
    return roleOrRoles === "ADMIN";
  }
  if (!Array.isArray(roleOrRoles)) return false;
  return roleOrRoles.includes("ADMIN");
}

export function isDeveloper(
  roleOrRoles: Role | readonly Role[] | null | undefined
): boolean {
  if (!roleOrRoles) return false;
  if (typeof roleOrRoles === "string") {
    return roleOrRoles === "DEVELOPER";
  }
  if (!Array.isArray(roleOrRoles)) return false;
  return roleOrRoles.includes("DEVELOPER");
}

export function isClient(
  roleOrRoles: Role | readonly Role[] | null | undefined
): boolean {
  if (!roleOrRoles) return false;
  if (typeof roleOrRoles === "string") {
    return roleOrRoles === "CLIENT";
  }
  if (!Array.isArray(roleOrRoles)) return false;
  return roleOrRoles.includes("CLIENT");
}

export const isOwnerOrAdmin = isAdmin;

/**
 * AI Relay Admin Route Guard: strictly restricted to ADMIN role.
 * DEVELOPER and CLIENT roles are rejected.
 */
export function canAccessAiRelayAdmin(
  roleOrRoles: Role | readonly Role[] | null | undefined
): boolean {
  return isAdmin(roleOrRoles);
}

/**
 * Resolves the primary role from an array of roles based on hierarchy:
 * ADMIN > DEVELOPER > CLIENT.
 */
export function getPrimaryRole(
  roleOrRoles: Role | readonly Role[] | null | undefined
): Role {
  if (!roleOrRoles) return "CLIENT";
  if (typeof roleOrRoles === "string") return roleOrRoles;
  if (!Array.isArray(roleOrRoles)) return "CLIENT";
  if (roleOrRoles.includes("ADMIN")) return "ADMIN";
  if (roleOrRoles.includes("DEVELOPER")) return "DEVELOPER";
  return roleOrRoles[0] ?? "CLIENT";
}

/**
 * Permission keys that control UI and API access.
 */
export const PERMISSIONS = {
  // Users
  USER_MANAGE: "user.manage",

  // Projects
  PROJECT_VIEW_ALL: "project.viewAll",
  PROJECT_CREATE: "project.create",
  PROJECT_EDIT: "project.edit",
  PROJECT_DELETE: "project.delete",

  // Invoices
  INVOICE_VIEW: "invoice.view",
  INVOICE_CREATE: "invoice.create",
  INVOICE_EDIT: "invoice.edit",
  INVOICE_DELETE: "invoice.delete",
  INVOICE_SEND: "invoice.send",

  // Blog
  BLOG_VIEW: "blog.view",
  BLOG_CREATE: "blog.create",
  BLOG_EDIT: "blog.edit",
  BLOG_DELETE: "blog.delete",
  BLOG_PUBLISH: "blog.publish",

  // Portfolio
  PORTFOLIO_VIEW: "portfolio.view",
  PORTFOLIO_MANAGE: "portfolio.manage",

  // Testimonials
  TESTIMONIAL_VIEW: "testimonial.view",
  TESTIMONIAL_MANAGE: "testimonial.manage",

  // Files
  FILE_MANAGE: "file.manage",

  // Proposals
  PROPOSAL_MANAGE: "proposal.manage",

  // Analytics
  ANALYTICS_VIEW: "analytics.view",

  // Timesheet & Team
  TIMESHEET_VIEW: "timesheet.view",
  TEAM_VIEW: "team.view",

  // Audit
  AUDIT_VIEW: "audit.view",

  // Settings
  SETTINGS_MANAGE: "settings.manage",

  // AI Relay Operations (Strictly ADMIN only)
  AI_RELAY_MANAGE: "aiRelay.manage",
  AI_RELAY_VIEW: "aiRelay.view",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Permission matrix per role.
 * ADMIN has everything; DEVELOPER handles technical delivery and operations.
 */
const ADMIN_ALL = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  ADMIN: ADMIN_ALL,
  DEVELOPER: [
    PERMISSIONS.PROJECT_VIEW_ALL,
    PERMISSIONS.PROJECT_CREATE,
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.BLOG_CREATE,
    PERMISSIONS.BLOG_EDIT,
    PERMISSIONS.PORTFOLIO_VIEW,
    PERMISSIONS.PORTFOLIO_MANAGE,
    PERMISSIONS.TESTIMONIAL_VIEW,
    PERMISSIONS.FILE_MANAGE,
    PERMISSIONS.TIMESHEET_VIEW,
    PERMISSIONS.TEAM_VIEW,
  ],
  CLIENT: [],
};

export function hasPermission(
  roleOrRoles: Role | readonly Role[] | null | undefined,
  permission: Permission
): boolean {
  if (!roleOrRoles) return false;
  if (typeof roleOrRoles === "string") {
    return ROLE_PERMISSIONS[roleOrRoles]?.includes(permission) ?? false;
  }
  if (!Array.isArray(roleOrRoles)) return false;
  return roleOrRoles.some(
    (r) => ROLE_PERMISSIONS[r as Role]?.includes(permission)
  );
}

export function hasAnyPermission(
  roleOrRoles: Role | readonly Role[] | null | undefined,
  ...permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(roleOrRoles, p));
}

export function getEffectivePermissions(
  roleOrRoles: Role | readonly Role[] | null | undefined
): readonly Permission[] {
  if (!roleOrRoles) return [];
  const list: readonly Role[] =
    typeof roleOrRoles === "string"
      ? [roleOrRoles]
      : Array.isArray(roleOrRoles)
      ? roleOrRoles
      : [];
  const set = new Set<Permission>();
  for (const r of list) {
    for (const p of ROLE_PERMISSIONS[r as Role] ?? []) {
      set.add(p);
    }
  }
  return Array.from(set);
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  DEVELOPER: "Developer",
  CLIENT: "Client",
};
