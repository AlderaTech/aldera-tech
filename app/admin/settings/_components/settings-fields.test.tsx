import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Settings } from "lucide-react";
import { SettingsSection, Field, SubmitBar } from "./settings-fields";
describe("Bagian pengaturan admin", () => {
  it("mempertahankan label, nilai awal dan tombol pending", () => {
    const html = renderToStaticMarkup(
      <SettingsSection
        icon={Settings}
        title="Identitas"
        description="Informasi situs"
      >
        <Field
          label="Nama brand"
          name="brandName"
          defaultValue="Aldera Tech"
          placeholder="Nama brand"
        />
        <SubmitBar pending label="Simpan profil" />
      </SettingsSection>
    );
    expect(html).toContain('for="brandName"');
    expect(html).toContain('name="brandName"');
    expect(html).toContain('value="Aldera Tech"');
    expect(html).toContain('placeholder="Nama brand"');
    expect(html).toContain("disabled");
  });
});
