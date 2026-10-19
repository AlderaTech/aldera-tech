import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/navigation", () => ({
  useRouter: () => ({ replace: mock(), push: mock(), refresh: mock() }),
  usePathname: () => "/admin/projects",
  useSearchParams: () => new URLSearchParams("q=test&page=1"),
  redirect: mock(),
  notFound: mock(),
  useParams: () => ({}),
}));

const { SearchFilterBar } = await import("./search-filter-bar");

describe("SearchFilterBar UI Component", () => {
  it("renders search input with placeholder and search icon", () => {
    const html = renderToStaticMarkup(
      <SearchFilterBar placeholder="Cari nama proyek..." searchParamKey="q" />
    );
    expect(html).toContain("Cari nama proyek...");
    expect(html).toContain('value="test"');
    expect(html).toContain("Bersihkan pencarian");
  });

  it("renders optional children controls", () => {
    const html = renderToStaticMarkup(
      <SearchFilterBar placeholder="Cari..." searchParamKey="q">
        <button type="button">Filter Kategori</button>
      </SearchFilterBar>
    );
    expect(html).toContain("Filter Kategori");
  });
});
