import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Children,
  isValidElement,
  type ComponentProps,
  type ReactNode,
} from "react";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { OverviewActivity } from "./overview-activity";
import { OverviewActivityDialog } from "./overview-activity-dialog";
import { recent } from "./_fixtures/overview";

function findDialog(
  node: ReactNode
): ComponentProps<typeof OverviewActivityDialog> | undefined {
  if (!isValidElement<{ children?: ReactNode }>(node)) return;
  if (node.type === OverviewActivityDialog)
    return node.props as ComponentProps<typeof OverviewActivityDialog>;
  for (const child of Children.toArray(node.props.children)) {
    const found = findDialog(child);
    if (found) return found;
  }
}

describe("Aktivitas Ringkasan", () => {
  it("mempertahankan CTA proyek pada keadaan kosong tanpa tombol modal", () => {
    const html = renderToStaticMarkup(<OverviewActivity recent={[]} />);
    expect(html).toContain("Belum ada aktivitas.");
    expect(html).toContain(`href="${DASHBOARD_ROUTES.projects}"`);
    expect(html).not.toContain("Lihat lebih lanjut");
  });
  it("menampilkan pratinjau ringkas, tombol Lihat lebih lanjut, serta modal dengan seluruh enam log asli", () => {
    const description = "PembaruanProyek".repeat(70);
    const logs = Array.from({ length: 6 }, (_, index) => ({
      ...recent[0],
      id: String(index),
      description,
      project: index ? null : recent[0].project,
    }));
    const html = renderToStaticMarkup(<OverviewActivity recent={logs} />);
    expect(html).toContain("Lihat lebih lanjut");
    expect(html).not.toContain('role="dialog"');
    expect(html.match(/<time\b/g)).toHaveLength(2);
    const dialog = findDialog(OverviewActivity({ recent: logs }));
    expect(dialog?.count).toBe(6);
    const details = renderToStaticMarkup(<>{dialog?.children}</>);
    expect(details.match(/<time\b/g)).toHaveLength(6);
    expect(details).toContain(description);
    expect(html).toContain(description);
    expect(html).toContain(recent[0].project!.title);
    expect(html).toMatch(/datetime="2026-10-21T08:30:00.000Z"/i);
    expect(html).not.toContain("Belum ada aktivitas.");
  });
});
