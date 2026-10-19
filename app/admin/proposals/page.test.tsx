import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

// Mock next/navigation
mock.module("next/navigation", () => ({
  useRouter: () => ({ replace: mock(), push: mock(), refresh: mock() }),
  usePathname: () => "/admin/proposals",
  useSearchParams: () => new URLSearchParams("q=PROP-01&status=SENT&page=1"),
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
      id: "prop-1",
      number: "PROP-2026-001",
      title: "Pengembangan Portal E-Commerce",
      clientName: "PT Maju Terus",
      totalAmount: 45000000,
      status: "SENT",
      createdAt: new Date("2026-10-18"),
      _count: { items: 3 },
    },
  ])
);
const mockCount = mock(() => Promise.resolve(1));

mock.module("@/lib/prisma", () => ({
  prisma: {
    proposal: {
      findMany: mockFindMany,
      count: mockCount,
    },
  },
}));

const { default: AdminProposalsPage } = await import("./page");

describe("AdminProposalsPage", () => {
  it("renders proposals page with search bar, status filter, table, and pagination", async () => {
    const pageElement = await AdminProposalsPage({
      searchParams: Promise.resolve({
        q: "PROP-2026",
        status: "SENT",
        page: "1",
      }),
    });

    const html = renderToStaticMarkup(pageElement);
    expect(html).toContain("Proposal");
    expect(html).toContain("PROP-2026-001");
    expect(html).toContain("Pengembangan Portal E-Commerce");
    expect(html).toContain("PT Maju Terus");
    expect(html).toContain("Cari nomor proposal, judul, atau client...");
    expect(html).toContain("Menampilkan");
  });

  it("handles empty proposal state gracefully", async () => {
    mockFindMany.mockImplementationOnce(() => Promise.resolve([]));
    mockCount.mockImplementationOnce(() => Promise.resolve(0));

    const pageElement = await AdminProposalsPage({
      searchParams: Promise.resolve({
        q: "nonexistent",
        status: "REJECTED",
        page: "1",
      }),
    });

    const html = renderToStaticMarkup(pageElement);
    expect(html).toContain(
      "Belum ada proposal atau tidak ada proposal yang sesuai kriteria filter."
    );
  });
});
