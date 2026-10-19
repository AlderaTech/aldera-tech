import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

// Mock next/navigation
mock.module("next/navigation", () => ({
  useRouter: () => ({ replace: mock(), push: mock(), refresh: mock() }),
  usePathname: () => "/admin/files",
  useSearchParams: () => new URLSearchParams("q=logo&type=IMAGE&page=1"),
  redirect: mock(),
  notFound: mock(),
  useParams: () => ({}),
}));

// Mock FileUploader component to keep test light
mock.module("@/components/dashboard/file-uploader", () => ({
  FileUploader: () => <div data-testid="file-uploader">FileUploader</div>,
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
      id: "file-1",
      filename: "logo-aldera.png",
      originalName: "logo-aldera.png",
      mimeType: "image/png",
      size: 1048576,
      url: "https://example.com/logo.png",
      path: "/uploads/logo.png",
      createdAt: new Date("2026-10-17"),
      uploader: { name: "Admin" },
      project: { id: "p-1", title: "Branding Aldera" },
    },
  ])
);
const mockCount = mock(() => Promise.resolve(1));

mock.module("@/lib/prisma", () => ({
  prisma: {
    file: {
      findMany: mockFindMany,
      count: mockCount,
    },
  },
}));

const { default: AdminFilesPage } = await import("./page");

describe("AdminFilesPage", () => {
  it("renders files page with search bar, type filter, cards, and pagination", async () => {
    const pageElement = await AdminFilesPage({
      searchParams: Promise.resolve({
        q: "logo",
        type: "IMAGE",
        page: "1",
      }),
    });

    const html = renderToStaticMarkup(pageElement);
    expect(html).toContain("File Manager");
    expect(html).toContain("logo-aldera.png");
    expect(html).toContain("Branding Aldera");
    expect(html).toContain("Cari nama file...");
    expect(html).toContain("Menampilkan");
  });

  it("handles empty files state gracefully", async () => {
    mockFindMany.mockImplementationOnce(() => Promise.resolve([]));
    mockCount.mockImplementationOnce(() => Promise.resolve(0));

    const pageElement = await AdminFilesPage({
      searchParams: Promise.resolve({
        q: "nonexistent",
        type: "PDF",
        page: "1",
      }),
    });

    const html = renderToStaticMarkup(pageElement);
    expect(html).toContain(
      "Belum ada file terunggah atau tidak ada file yang sesuai kriteria."
    );
  });
});
