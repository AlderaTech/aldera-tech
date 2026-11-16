import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { OverviewWorkChart } from "./overview-work-chart";

it("renders actual counts without inventing progress when no tasks exist", () => {
  const empty = renderToStaticMarkup(
    <OverviewWorkChart data={{ completed: 0, active: 0, pending: 0 }} />
  );
  expect(empty).toContain("Belum ada milestone atau tugas.");
  expect(empty).not.toContain("33%");
  const html = renderToStaticMarkup(
    <OverviewWorkChart data={{ completed: 2, active: 1, pending: 1 }} />
  );
  expect(html).toContain("50%");
  expect(html).toContain(
    "4 milestone dan tugas: 2 selesai, 1 berjalan, 1 menunggu."
  );
});
