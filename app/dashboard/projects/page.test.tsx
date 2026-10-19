import { beforeEach, describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DASHBOARD_ROUTES } from "@/lib/routes";

const mockCount = mock(async (): Promise<number> => 0);
const mockFindMany = mock(async (): Promise<unknown[]> => []);

mock.module("@/auth", () => ({
  auth: async () => ({ user: { id: "test-client" } }),
}));

mock.module("@/lib/prisma", () => ({
  prisma: {
    project: {
      count: mockCount,
      findMany: mockFindMany,
    },
  },
}));

mock.module("next/navigation", () => ({
  useRouter: () => ({ refresh: mock(), replace: mock(), push: mock() }),
  usePathname: () => "/dashboard/projects",
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const { default: Page, metadata } = await import("./page");
const { ProjectsContent } = await import("./_components/projects-content");
const { ProjectFilters } = await import("./_components/project-filters");

describe("Halaman Proyek Klien (/dashboard/projects)", () => {
  beforeEach(() => {
    mockCount.mockReset();
    mockFindMany.mockReset();
    mockCount.mockResolvedValue(0);
    mockFindMany.mockResolvedValue([]);
  });

  it("memiliki judul dan metadata SEO yang benar", () => {
    expect(metadata.title).toBe("Proyek Saya");
    expect(metadata.description).toContain("semua proyek");
  });

  it("menampilkan ProjectsEmptyState jika belum ada proyek sama sekali", async () => {
    mockCount.mockResolvedValueOnce(0);
    mockFindMany.mockResolvedValueOnce([]);

    const html = renderToStaticMarkup(await ProjectsContent());
    expect(html).toContain("Belum ada proyek");
  });

  it("memanggil query prisma dengan filter status dan kata kunci pencarian", async () => {
    mockCount.mockResolvedValueOnce(1);
    mockFindMany.mockResolvedValueOnce([
      {
        id: "proj-1",
        title: "Website Aldera",
        description: "Company profile",
        status: "IN_PROGRESS",
        progress: 60,
        deadline: new Date("2026-12-31"),
        updatedAt: new Date("2026-03-01"),
      },
    ]);

    await ProjectsContent({
      searchParams: { q: "aldera", status: "IN_PROGRESS", page: "2" },
    });

    expect(mockCount).toHaveBeenCalledWith({
      where: {
        clientId: "test-client",
        status: "IN_PROGRESS",
        title: {
          contains: "aldera",
          mode: "insensitive",
        },
      },
    });

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        clientId: "test-client",
        status: "IN_PROGRESS",
        title: {
          contains: "aldera",
          mode: "insensitive",
        },
      },
      orderBy: { updatedAt: "desc" },
      skip: 6,
      take: 6,
    });
  });

  it("menampilkan pesan filter kosong jika pencarian tidak menemukan hasil", async () => {
    mockCount.mockResolvedValueOnce(0);
    mockFindMany.mockResolvedValueOnce([]);

    const html = renderToStaticMarkup(
      await ProjectsContent({
        searchParams: { q: "nonexistent" },
      })
    );

    expect(html).toContain(
      "Tidak ada proyek yang sesuai dengan kriteria filter"
    );
    expect(html).toContain(DASHBOARD_ROUTES.projects);
  });

  it("menampilkan kartu proyek dan paginasi jika ada data", async () => {
    mockCount.mockResolvedValueOnce(15);
    mockFindMany.mockResolvedValueOnce([
      {
        id: "proj-1",
        title: "Proyek Pertama",
        description: "Deskripsi proyek",
        status: "COMPLETED",
        progress: 100,
        deadline: null,
        updatedAt: new Date("2026-01-01"),
      },
    ]);

    const html = renderToStaticMarkup(
      await ProjectsContent({ searchParams: { page: "1" } })
    );

    expect(html).toContain("Proyek Pertama");
    expect(html).toContain("Daftar proyek");
    expect(html).toContain("15");
    expect(html).toContain('aria-label="Paginasi navigasi data"');
  });

  it("merender filter status pills pada ProjectFilters", () => {
    const html = renderToStaticMarkup(<ProjectFilters />);
    expect(html).toContain("Filter status proyek");
    expect(html).toContain("Semua");
    expect(html).toContain("Berjalan");
    expect(html).toContain("Review");
    expect(html).toContain("Selesai");
    expect(html).toContain("Pending");
    expect(html).toContain("Dibatalkan");
  });

  it("menangani error database dengan ProjectsLoadError", async () => {
    mockCount.mockRejectedValueOnce(new Error("DB Down"));
    const html = renderToStaticMarkup(await ProjectsContent());
    expect(html).toContain("Proyek belum dapat dimuat");
  });

  it("merender halaman utama UserProjectsPage dengan benar", async () => {
    const pageResult = await Page({
      searchParams: Promise.resolve({ q: "test" }),
    });
    expect(pageResult).toBeDefined();
  });
});
