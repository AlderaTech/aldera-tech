import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

// Mock next/navigation
mock.module("next/navigation", () => ({
  useRouter: () => ({ replace: mock(), push: mock(), refresh: mock() }),
  usePathname: () => "/admin/portfolio",
  useSearchParams: () =>
    new URLSearchParams("q=Fintech&status=published&page=1"),
  redirect: mock(),
  notFound: mock(),
  useParams: () => ({}),
}));

const { PortfolioTable } = await import("./portfolio-table");

const mockItems = [
  {
    id: "cs-1",
    slug: "fintech-platform",
    title: "Fintech Core Platform",
    client: "Bank Digital",
    industry: "Financial Services",
    summary: "Ringkasan studi kasus",
    challenge: "Tantangan",
    solution: "Solusi",
    result: "Hasil",
    featuredImage: null,
    techStack: ["Next.js", "TypeScript", "PostgreSQL"],
    published: true,
    order: 1,
    createdAt: new Date("2026-10-10"),
    updatedAt: new Date("2026-10-10"),
  },
  {
    id: "cs-2",
    slug: "healthcare-app",
    title: "Healthcare Telemed App",
    client: "Klinik Sehat",
    industry: "Healthcare",
    summary: "Ringkasan telemedicine",
    challenge: "Tantangan telemedicine",
    solution: "Solusi telemedicine",
    result: "Hasil telemedicine",
    featuredImage: null,
    techStack: ["React Native"],
    published: false,
    order: 2,
    createdAt: new Date("2026-10-15"),
    updatedAt: new Date("2026-10-15"),
  },
];

describe("PortfolioTable Component", () => {
  it("renders search input, status filter pills, table rows, and pagination", () => {
    const html = renderToStaticMarkup(<PortfolioTable items={mockItems} />);

    expect(html).toContain("Cari judul, klien, atau industri...");
    expect(html).toContain("Fintech Core Platform");
    expect(html).toContain("Bank Digital");
    expect(html).toContain("Published");
    expect(html).toContain("Menampilkan");
  });

  it("renders empty state when no portfolio items match", () => {
    const html = renderToStaticMarkup(<PortfolioTable items={[]} />);

    expect(html).toContain("Tidak ada studi kasus yang sesuai.");
  });
});
