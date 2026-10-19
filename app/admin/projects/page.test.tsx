import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

// Mock next/navigation
mock.module("next/navigation", () => ({
  useRouter: () => ({ replace: mock(), push: mock(), refresh: mock() }),
  usePathname: () => "/admin/projects",
  useSearchParams: () => new URLSearchParams("q=web&status=IN_PROGRESS&page=1"),
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
      id: "proj-1",
      title: "Website Redesign Aldera",
      status: "IN_PROGRESS",
      progress: 60,
      deadline: new Date("2026-12-01"),
      budget: 25000000,
      client: { name: "Client PT ABC" },
    },
  ])
);
const mockCount = mock(() => Promise.resolve(1));

mock.module("@/lib/prisma", () => ({
  prisma: {
    project: {
      findMany: mockFindMany,
      count: mockCount,
    },
  },
}));

const { default: AdminProjectsList } = await import("./page");

describe("AdminProjectsList Page", () => {
  it("renders projects list with search, filter, and pagination", async () => {
    const pageElement = await AdminProjectsList({
      searchParams: Promise.resolve({
        q: "Aldera",
        status: "IN_PROGRESS",
        page: "1",
      }),
    });

    const html = renderToStaticMarkup(pageElement);
    expect(html).toContain("Proyek");
    expect(html).toContain("Website Redesign Aldera");
    expect(html).toContain("Client PT ABC");
    expect(html).toContain("Cari judul proyek atau nama client...");
    expect(html).toContain("Menampilkan");
  });

  it("handles empty project state gracefully", async () => {
    mockFindMany.mockImplementationOnce(() => Promise.resolve([]));
    mockCount.mockImplementationOnce(() => Promise.resolve(0));

    const pageElement = await AdminProjectsList({
      searchParams: Promise.resolve({
        q: "nonexistent",
        status: "CANCELLED",
        page: "1",
      }),
    });

    const html = renderToStaticMarkup(pageElement);
    expect(html).toContain(
      "Belum ada proyek atau tidak ada proyek yang sesuai kriteria."
    );
  });
});
