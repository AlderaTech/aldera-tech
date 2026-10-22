import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { OverviewWelcome } from "./overview-welcome";
import { user } from "./_fixtures/overview";

describe("Sambutan Ringkasan", () => {
  it("mempertahankan identitas akun, inisial, dan tautan profil", () => {
    const html = renderToStaticMarkup(<OverviewWelcome user={user} />);
    expect(html).toContain("Halo, Maya");
    expect(html).toContain(user.email!);
    expect(html).toContain("MP");
    expect(html).toContain(`href="${DASHBOARD_ROUTES.profile}"`);
    expect(html).toContain('sizes="(min-width: 640px) 80px, 1px"');
    expect(html).toContain('alt=""');
  });
  it("menangani nama/email kosong dan identitas panjang tanpa mengubah konten", () => {
    expect(
      renderToStaticMarkup(
        <OverviewWelcome user={{ ...user, name: null, email: null }} />
      )
    ).toContain("Halo, User");
    const email = "pengguna".repeat(30) + "@example.test";
    expect(
      renderToStaticMarkup(<OverviewWelcome user={{ ...user, email }} />)
    ).toContain(email);
  });
});
