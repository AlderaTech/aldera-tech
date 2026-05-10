import type { Role } from "@prisma/client";

/**
 * Roles that have access to /admin (non-client roles).
 * CLIENT is the only public-facing role; everyone else has admin access
 * with varying permission levels (see ROLE_PERMISSIONS).
 */
export const STAFF_ROLES = [
  "OWNER",
  "ADMIN",
  "DESIGNER",
  "DEVELOPER",
  "ACCOUNTANT",
] as const satisfies readonly Role[];

export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaff(role: Role | null | undefined): role is StaffRole {
  if (!role) return false;
  return (STAFF_ROLES as readonly Role[]).includes(role);
}

export function isOwnerOrAdmin(role: Role | null | undefined): boolean {
  return role === "OWNER" || role === "ADMIN";
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

  // Files
  FILE_MANAGE: "file.manage",

  // Proposals
  PROPOSAL_MANAGE: "proposal.manage",

  // Analytics
  ANALYTICS_VIEW: "analytics.view",

  // Audit
  AUDIT_VIEW: "audit.view",

  // Settings
  SETTINGS_MANAGE: "settings.manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Permission matrix per role.
 * OWNER has everything; lower roles have progressively fewer.
 */
const OWNER_ALL = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  OWNER: OWNER_ALL,
  ADMIN: OWNER_ALL.filter(
    (p) => p !== PERMISSIONS.AUDIT_VIEW
  ),
  DESIGNER: [
    PERMISSIONS.PROJECT_VIEW_ALL,
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.BLOG_CREATE,
    PERMISSIONS.BLOG_EDIT,
    PERMISSIONS.FILE_MANAGE,
  ],
  DEVELOPER: [
    PERMISSIONS.PROJECT_VIEW_ALL,
    PERMISSIONS.PROJECT_EDIT,
    PERMISSIONS.BLOG_VIEW,
    PERMISSIONS.BLOG_CREATE,
    PERMISSIONS.BLOG_EDIT,
    PERMISSIONS.FILE_MANAGE,
  ],
  ACCOUNTANT: [
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_EDIT,
    PERMISSIONS.INVOICE_SEND,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.PROJECT_VIEW_ALL,
  ],
  CLIENT: [],
};

export function hasPermission(
  role: Role | null | undefined,
  permission: Permission
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(
  role: Role | null | undefined,
  ...permissions: Permission[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  DESIGNER: "Designer",
  DEVELOPER: "Developer",
  ACCOUNTANT: "Accountant",
  CLIENT: "Client",
};
