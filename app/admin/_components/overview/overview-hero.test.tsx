import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { getOverviewQuickActions } from "../../_utils/overview-config";
import { ADMIN_ROUTES } from "@/lib/routes";
import { OverviewHero } from "./overview-hero";
describe("Sambutan Admin", () => {
  it("mempertahankan tiga tindakan sesuai permission dan aset maskot asli", () => {
    const actions = getOverviewQuickActions("ADMIN");
    const html = renderToStaticMarkup(<OverviewHero actions={actions} />);
    for (const route of [
      ADMIN_ROUTES.projectNew,
      ADMIN_ROUTES.proposalNew,
      ADMIN_ROUTES.invoiceNew,
    ])
      expect(html).toContain(`href="${route}"`);
    expect(html).toContain("aldera-profile-guide.webp");
    expect(html).toContain("RINGKASAN SISTEM");
    expect(html).toContain('alt=""');
    expect(html).toContain('aria-hidden="true"');
  });
  it("tidak membuat tindakan saat role tidak memiliki akses", () => {
    expect(renderToStaticMarkup(<OverviewHero actions={[]} />)).not.toContain(
      'data-slot="button"'
    );
  });
});
