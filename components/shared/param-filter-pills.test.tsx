import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/navigation", () => ({
  useRouter: () => ({ replace: mock(), push: mock(), refresh: mock() }),
  usePathname: () => "/admin/projects",
  useSearchParams: () => new URLSearchParams("status=IN_PROGRESS"),
  redirect: mock(),
  notFound: mock(),
  useParams: () => ({}),
}));

const { ParamFilterPills } = await import("./param-filter-pills");

describe("ParamFilterPills Component", () => {
  it("renders pill buttons with active state matching URL query param", () => {
    const html = renderToStaticMarkup(
      <ParamFilterPills
        paramKey="status"
        options={[
          { label: "Semua", value: "ALL" },
          { label: "In Progress", value: "IN_PROGRESS", count: 5 },
          { label: "Selesai", value: "COMPLETED", count: 12 },
        ]}
      />
    );

    expect(html).toContain("Semua");
    expect(html).toContain("In Progress (5)");
    expect(html).toContain("Selesai (12)");
  });
});
