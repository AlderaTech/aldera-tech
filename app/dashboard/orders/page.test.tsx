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
    orderRequest: {
      count: mockCount,
      findMany: mockFindMany,
    },
  },
}));

mock.module("next/navigation", () => ({
  useRouter: () => ({ refresh: mock(), replace: mock(), push: mock() }),
  usePathname: () => "/dashboard/orders",
  useSearchParams: () => new URLSearchParams(),
}));

const { default: Page, metadata } = await import("./page");
const { OrdersContent } = await import("./_components/orders-content");
const { OrderStatusFilter } = await import("./_components/order-status-filter");

describe("Halaman Riwayat Estimasi (/dashboard/orders)", () => {
  beforeEach(() => {
    mockCount.mockReset();
    mockFindMany.mockReset();
    mockCount.mockResolvedValue(0);
    mockFindMany.mockResolvedValue([]);
  });

  it("memiliki metadata SEO yang valid", () => {
    expect(metadata.title).toBe("Riwayat Estimasi");
    expect(metadata.description).toContain("estimasi proyek");
  });

  it("menampilkan OrdersEmptyState jika belum ada estimasi sama sekali", async () => {
    mockCount.mockResolvedValueOnce(0);
    mockFindMany.mockResolvedValueOnce([]);

    const html = renderToStaticMarkup(await OrdersContent());
    expect(html).toContain("Belum ada estimasi");
  });

  it("memfilter status dan menerapkan paginasi", async () => {
    mockCount.mockResolvedValueOnce(1);
    mockFindMany.mockResolvedValueOnce([
      {
        id: "ord-1",
        status: "PENDING",
        estimatedTotal: { toString: () => "5000000" },
        urgency: "normal",
        deadline: null,
        notes: "Perlu website cepat",
        createdAt: new Date("2026-03-01"),
        projectType: { name: "Web Application" },
      },
    ]);

    await OrdersContent({
      searchParams: { status: "PENDING", page: "2" },
    });

    expect(mockCount).toHaveBeenCalledWith({
      where: {
        userId: "test-client",
        status: "PENDING",
      },
    });

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        userId: "test-client",
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
      skip: 6,
      take: 6,
      include: { projectType: { select: { name: true } } },
    });
  });

  it("menampilkan pesan filter kosong jika filter status tidak menemukan data", async () => {
    mockCount.mockResolvedValueOnce(0);
    mockFindMany.mockResolvedValueOnce([]);

    const html = renderToStaticMarkup(
      await OrdersContent({
        searchParams: { status: "CONVERTED" },
      })
    );

    expect(html).toContain("Tidak ada riwayat estimasi dengan status ini");
    expect(html).toContain(DASHBOARD_ROUTES.orders);
  });

  it("menampilkan daftar estimasi dan paginasi jika ada data", async () => {
    mockCount.mockResolvedValueOnce(12);
    mockFindMany.mockResolvedValueOnce([
      {
        id: "ord-1",
        status: "REVIEWED",
        estimatedTotal: 10000000,
        urgency: "urgent",
        deadline: new Date("2026-06-01"),
        notes: null,
        features: ["auth"],
        customFeatures: [],
        createdAt: new Date("2026-02-15"),
        projectType: { name: "E-Commerce" },
      },
    ]);

    const html = renderToStaticMarkup(
      await OrdersContent({ searchParams: { page: "1" } })
    );

    expect(html).toContain("Pengajuan Anda");
    expect(html).toContain("12");
    expect(html).toContain('aria-label="Paginasi navigasi data"');
  });

  it("merender tombol filter status pada OrderStatusFilter", () => {
    const html = renderToStaticMarkup(<OrderStatusFilter />);
    expect(html).toContain("Filter status pengajuan estimasi");
    expect(html).toContain("Semua");
    expect(html).toContain("Menunggu Review");
    expect(html).toContain("Sedang Diproses");
    expect(html).toContain("Dikonversi");
    expect(html).toContain("Dibatalkan");
  });

  it("menangani error database dengan OrdersLoadError", async () => {
    mockCount.mockRejectedValueOnce(new Error("Database error"));
    const html = renderToStaticMarkup(await OrdersContent());
    expect(html).toContain("Estimasi belum dapat dimuat");
  });

  it("merender halaman OrderHistoryPage dengan aman", async () => {
    const pageResult = await Page({
      searchParams: Promise.resolve({ status: "PENDING" }),
    });
    expect(pageResult).toBeDefined();
  });
});
