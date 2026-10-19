import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

// Mock next/navigation
mock.module("next/navigation", () => ({
  useRouter: () => ({ replace: mock(), push: mock(), refresh: mock() }),
  usePathname: () => "/admin/blog",
  useSearchParams: () =>
    new URLSearchParams("q=Next.js&status=PUBLISHED&page=1"),
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
      id: "post-1",
      slug: "panduan-nextjs-15",
      title: "Panduan Lengkap Next.js 15",
      published: true,
      publishedAt: new Date("2026-10-10"),
      createdAt: new Date("2026-10-10"),
      category: { name: "Web Development" },
      author: { name: "Admin" },
    },
  ])
);
const mockCount = mock(() => Promise.resolve(1));

mock.module("@/lib/prisma", () => ({
  prisma: {
    blogPost: {
      findMany: mockFindMany,
      count: mockCount,
    },
  },
}));

const { default: AdminBlogPage } = await import("./page");

describe("AdminBlogPage", () => {
  it("renders blog page with search bar, status filter, table, and pagination", async () => {
    const pageElement = await AdminBlogPage({
      searchParams: Promise.resolve({
        q: "Next.js",
        status: "PUBLISHED",
        page: "1",
      }),
    });

    const html = renderToStaticMarkup(pageElement);
    expect(html).toContain("Blog");
    expect(html).toContain("Panduan Lengkap Next.js 15");
    expect(html).toContain("Web Development");
    expect(html).toContain("Cari judul artikel blog...");
    expect(html).toContain("Menampilkan");
  });

  it("handles empty blog state gracefully", async () => {
    mockFindMany.mockImplementationOnce(() => Promise.resolve([]));
    mockCount.mockImplementationOnce(() => Promise.resolve(0));

    const pageElement = await AdminBlogPage({
      searchParams: Promise.resolve({
        q: "nonexistent",
        status: "DRAFT",
        page: "1",
      }),
    });

    const html = renderToStaticMarkup(pageElement);
    expect(html).toContain("Belum ada post. Buat yang pertama!");
  });
});
