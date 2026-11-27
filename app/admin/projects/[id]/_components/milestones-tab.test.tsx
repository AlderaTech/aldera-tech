import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../../_test-utils/page-mocks";
installAdminPageMocks();
const { MilestonesTab } = await import("./milestones-tab");
describe("Milestone admin", () => {
  it("tetap menyediakan tindakan dan status milestone dari sumber", () => {
    const html = renderToStaticMarkup(
      <MilestonesTab
        projectId="project-ui"
        milestones={[
          {
            id: "m-ui",
            title: "Rancangan disetujui",
            description: "Dokumen asli",
            status: "IN_PROGRESS",
            dueDate: new Date("2026-12-31"),
            completedAt: null,
          },
        ]}
      />
    );
    expect(html).toContain("Rancangan disetujui");
    expect(html).toContain("Tambah");
    expect(html).toContain("Milestone");
  });
});
