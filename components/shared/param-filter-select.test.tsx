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

const { ParamFilterSelect } = await import("./param-filter-select");

describe("ParamFilterSelect Component", () => {
  it("renders trigger element with accessibility attributes", () => {
    const html = renderToStaticMarkup(
      <ParamFilterSelect
        paramKey="status"
        placeholder="Filter Status"
        options={[
          { label: "Semua Status", value: "ALL" },
          { label: "In Progress", value: "IN_PROGRESS" },
        ]}
      />
    );

    expect(html).toContain('aria-label="Filter Status"');
  });
});
