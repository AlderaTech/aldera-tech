import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { OperationalPanel } from "./operational-panel";
import {
  getOperationalCards,
  getOverviewQuickActions,
} from "../../_utils/overview-config";
describe("Panel operasional", () => {
  it("memakai data dan route yang sudah disaring permission", () => {
    const cards = getOperationalCards("ADMIN", {
      total: 5,
      active: 3,
      pending: 2,
      orderPending: 1,
      revenue: 1000,
    });
    const actions = getOverviewQuickActions("ADMIN");
    const html = renderToStaticMarkup(
      <OperationalPanel cards={cards} actions={actions} />
    );
    for (const item of [...cards, ...actions])
      expect(html).toContain(`href="${item.href}"`);
    expect(html).toContain(">3<");
    expect(html).toContain(">2<");
  });
  it("tidak menambahkan CTA pada daftar tindakan kosong", () => {
    const html = renderToStaticMarkup(
      <OperationalPanel cards={[]} actions={[]} />
    );
    expect(html).not.toContain("Aksi Cepat");
    expect(html).not.toContain("<a ");
  });
});
