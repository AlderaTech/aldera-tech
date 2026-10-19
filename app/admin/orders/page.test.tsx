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
  usePathname: () => "/admin/orders",
  useSearchParams: () => new URLSearchParams("q=Budi&status=PENDING&page=1"),
  redirect: mock(),
  notFound: mock(),
  useParams: () => ({}),
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
      id: "ord-1",
      status: "PENDING",
      estimatedTotal: 15000000,
      urgency: "normal",
      notes: "Mohon segera dikerjakan",
      features: ["auth", "payment"],
      customFeatures: [],
      addOns: [],
      createdAt: new Date("2026-10-15"),
      user: { name: "Budi Santoso", email: "budi@example.com" },
      projectType: { name: "Web Application" },
    },
  ])
);
const mockCount = mock(() => Promise.resolve(1));

mock.module("@/lib/prisma", () => ({
  prisma: {
    orderRequest: {
      findMany: mockFindMany,
      count: mockCount,
    },
  },
}));

const { default: AdminOrdersPage } = await import("./page");

describe("AdminOrdersPage", () => {
  it("renders orders page with search bar, status filter, order card, and pagination", async () => {
    const pageElement = await AdminOrdersPage({
      searchParams: Promise.resolve({
        q: "Budi",
        status: "PENDING",
        page: "1",
      }),
    });

    const html = renderToStaticMarkup(pageElement);
    expect(html).toContain("Order Requests");
    expect(html).toContain("Budi Santoso");
    expect(html).toContain("budi@example.com");
    expect(html).toContain("Web Application");
    expect(html).toContain("Cari nama client, email, atau tipe proyek...");
    expect(html).toContain("Menampilkan");
  });

  it("handles empty order state gracefully", async () => {
    mockFindMany.mockImplementationOnce(() => Promise.resolve([]));
    mockCount.mockImplementationOnce(() => Promise.resolve(0));

    const pageElement = await AdminOrdersPage({
      searchParams: Promise.resolve({
        q: "nonexistent",
        status: "CANCELLED",
        page: "1",
      }),
    });

    const html = renderToStaticMarkup(pageElement);
    expect(html).toContain(
      "Belum ada order request atau tidak ada yang sesuai kriteria."
    );
  });
});
