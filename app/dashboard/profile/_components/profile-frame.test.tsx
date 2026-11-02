import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ProfileFrame } from "./profile-frame";
import { ProfileIdentity } from "./profile-identity";
describe("Banner profil", () => {
  it("menjaga batas halaman dan isi profil tanpa mengganti avatar pengguna", () => {
    const html = renderToStaticMarkup(
      <ProfileFrame>
        <p>Data profil asli</p>
      </ProfileFrame>
    );
    expect(html).toContain("data-profile-page");
    expect(html).toContain('id="profile-heading">Profil Saya</h1>');
    expect(html).toContain("Data profil asli");
    expect(html).toContain("lucide-user-round");
    expect(html).not.toContain("data-workspace-banner");
    expect(html).not.toContain("<img");
  });
  it("menyisakan satu maskot di kartu identitas dan header polos di luarnya", () => {
    const html = renderToStaticMarkup(
      <ProfileFrame>
        <ProfileIdentity
          user={{
            id: "profile-preview",
            name: "Rafli Maulana",
            email: "preview@example.test",
            phone: null,
            avatar: null,
            roles: ["ADMIN", "DEVELOPER"],
            createdAt: new Date("2026-01-01T00:00:00Z"),
          }}
        />
      </ProfileFrame>
    );
    expect(html.match(/data-profile-mascot="guide"/g)).toHaveLength(1);
    expect(html.match(/<img\b/g)).toHaveLength(1);
    expect(html).toContain("RM");
    expect(html).toContain("Rafli Maulana");
    expect(html).toContain("preview@example.test");
    expect(html).not.toContain("data-workspace-banner-visual");
  });
});
