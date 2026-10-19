import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

// Mock next/navigation
mock.module("next/navigation", () => ({
  useRouter: () => ({ replace: mock(), push: mock(), refresh: mock() }),
  usePathname: () => "/admin/testimonials",
  useSearchParams: () => new URLSearchParams("q=Budi&status=published&page=1"),
  redirect: mock(),
  notFound: mock(),
  useParams: () => ({}),
}));

const { TestimonialTable } = await import("./testimonial-table");

const mockItems = [
  {
    id: "testi-1",
    clientName: "Budi Santoso",
    clientRole: "CEO, PT Maju",
    content: "Aldera sangat profesional dan pengerjaan cepat.",
    rating: 5,
    avatar: null,
    published: true,
    order: 1,
    createdAt: new Date("2026-10-10"),
    updatedAt: new Date("2026-10-10"),
    projectId: "proj-1",
    project: { id: "proj-1", title: "Portal HRIS" },
  },
  {
    id: "testi-2",
    clientName: "Siti Rahma",
    clientRole: "CTO, StartUp",
    content: "Kualitas kode sangat bersih.",
    rating: 5,
    avatar: null,
    published: false,
    order: 2,
    createdAt: new Date("2026-10-12"),
    updatedAt: new Date("2026-10-12"),
    projectId: null,
    project: null,
  },
];

describe("TestimonialTable Component", () => {
  it("renders search input, status filter pills, table rows, and pagination", () => {
    const html = renderToStaticMarkup(
      <TestimonialTable
        items={mockItems}
        onEdit={mock()}
        onDelete={mock()}
        onRefresh={mock()}
      />
    );

    expect(html).toContain("Cari nama klien, ulasan, atau proyek...");
    expect(html).toContain("Budi Santoso");
    expect(html).toContain("Portal HRIS");
    expect(html).toContain("Published");
    expect(html).toContain("Menampilkan");
  });

  it("renders empty state when no testimonials match", () => {
    const html = renderToStaticMarkup(
      <TestimonialTable
        items={[]}
        onEdit={mock()}
        onDelete={mock()}
        onRefresh={mock()}
      />
    );

    expect(html).toContain("Tidak ada testimoni yang ditemukan.");
  });
});
