import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

// Mock next/navigation
mock.module("next/navigation", () => ({
  useRouter: () => ({ replace: mock(), push: mock(), refresh: mock() }),
  usePathname: () => "/admin/invoices",
  useSearchParams: () => new URLSearchParams("q=INV-001&status=PAID&page=1"),
  redirect: mock(),
  notFound: mock(),
  useParams: () => ({}),
}));

// Mock safeDb and prisma
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
      id: "inv-1",
      number: "INV-2026-001",
      status: "PAID",
      total: 5000000,
      dueDate: new Date("2026-11-01"),
      client: { name: "Client PT Solvo" },
      project: { title: "Mobile App" },
    },
  ])
);
const mockCount = mock(() => Promise.resolve(1));

mock.module("@/lib/prisma", () => ({
  prisma: {
    invoice: {
      findMany: mockFindMany,
      count: mockCount,
    },
  },
}));

const { default: AdminInvoicesPage } = await import("./page");

describe("AdminInvoicesPage", () => {
  it("renders invoices page with search bar, status filter, table, and pagination", async () => {
    const pageElement = await AdminInvoicesPage({
      searchParams: Promise.resolve({
        q: "INV-2026",
        status: "PAID",
        page: "1",
      }),
    });

    const html = renderToStaticMarkup(pageElement);
    expect(html).toContain("Invoice");
    expect(html).toContain("INV-2026-001");
    expect(html).toContain("Client PT Solvo");
    expect(html).toContain("Cari nomor invoice, client, atau proyek...");
    expect(html).toContain("Menampilkan");
  });

  it("handles empty invoice state correctly", async () => {
    mockFindMany.mockImplementationOnce(() => Promise.resolve([]));
    mockCount.mockImplementationOnce(() => Promise.resolve(0));

    const pageElement = await AdminInvoicesPage({
      searchParams: Promise.resolve({
        q: "unknown",
        status: "DRAFT",
        page: "1",
      }),
    });

    const html = renderToStaticMarkup(pageElement);
    expect(html).toContain("Belum ada invoice.");
  });
});
