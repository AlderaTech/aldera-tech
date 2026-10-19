import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/navigation", () => ({
  useRouter: () => ({ replace: mock(), push: mock(), refresh: mock() }),
  usePathname: () => "/test-path",
  useSearchParams: () => new URLSearchParams("page=2"),
  redirect: mock(),
  notFound: mock(),
  useParams: () => ({}),
}));

const { DataPagination } = await import("./data-pagination");

describe("DataPagination UI Component", () => {
  it("renders correctly with given page parameters", () => {
    const html = renderToStaticMarkup(
      <DataPagination currentPage={2} totalItems={45} pageSize={10} />
    );
    expect(html).toContain("Menampilkan");
    expect(html).toContain("11–20");
    expect(html).toContain("45");
    expect(html).toContain("Hal. 2 / 5");
    expect(html).toContain("Sebelumnya");
    expect(html).toContain("Berikutnya");
  });

  it("returns null when totalItems is 0 and page is 1", () => {
    const html = renderToStaticMarkup(
      <DataPagination currentPage={1} totalItems={0} pageSize={10} />
    );
    expect(html).toBe("");
  });
});
