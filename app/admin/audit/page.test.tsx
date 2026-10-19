import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

// Mock auth
mock.module("@/auth", () => ({
  auth: () =>
    Promise.resolve({
      user: { id: "admin-1", role: "ADMIN", name: "Super Admin" },
    }),
}));

// Mock next/navigation
mock.module("next/navigation", () => ({
  useRouter: () => ({ replace: mock(), push: mock(), refresh: mock() }),
  usePathname: () => "/admin/audit",
  useSearchParams: () => new URLSearchParams("q=LOGIN&action=LOGIN&page=1"),
  redirect: mock(),
  notFound: mock(),
  useParams: () => ({}),
}));

// Mock permissions
mock.module("@/lib/permissions", () => ({
  hasPermission: () => true,
  PERMISSIONS: { AUDIT_VIEW: "audit.view" },
  ROLE_LABELS: { ADMIN: "Admin", DEVELOPER: "Developer", CLIENT: "Client" },
}));

// Mock safeDb
mock.module("@/lib/safe-db", () => ({
  safeDb: async (fn: () => Promise<unknown>, fallback: unknown) => {
    try {
      return await fn();
    } catch {
      return fallback;
    }
  },
}));

const mockFindMany = mock(() =>
  Promise.resolve([
    {
      id: "log-1",
      action: "USER_LOGIN",
      entityType: "User",
      entityId: "u-12345678",
      ip: "127.0.0.1",
      createdAt: new Date("2026-10-18T10:00:00Z"),
      user: {
        name: "Admin User",
        email: "admin@example.com",
        roles: ["ADMIN"],
      },
    },
  ])
);
const mockCount = mock(() => Promise.resolve(1));

mock.module("@/lib/prisma", () => ({
  prisma: {
    auditLog: {
      findMany: mockFindMany,
      count: mockCount,
    },
  },
}));

const { default: AuditLogPage } = await import("./page");

describe("AuditLogPage", () => {
  it("renders audit page with search bar, action filter, table, and pagination", async () => {
    const pageElement = await AuditLogPage({
      searchParams: Promise.resolve({
        q: "USER_LOGIN",
        action: "LOGIN",
        page: "1",
      }),
    });

    const html = renderToStaticMarkup(pageElement);
    expect(html).toContain("Audit Log");
    expect(html).toContain("USER_LOGIN");
    expect(html).toContain("Admin User");
    expect(html).toContain("Cari user, email, aksi, atau entitas...");
    expect(html).toContain("Menampilkan");
  });

  it("handles empty audit log state gracefully", async () => {
    mockFindMany.mockImplementationOnce(() => Promise.resolve([]));
    mockCount.mockImplementationOnce(() => Promise.resolve(0));

    const pageElement = await AuditLogPage({
      searchParams: Promise.resolve({
        q: "nonexistent",
        action: "DELETE",
        page: "1",
      }),
    });

    const html = renderToStaticMarkup(pageElement);
    expect(html).toContain(
      "Belum ada audit log atau tidak ada log yang sesuai kriteria filter."
    );
  });
});
