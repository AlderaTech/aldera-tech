import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { FolderKanban } from "lucide-react";
import { AdminStatCard } from "./admin-stat-card";
describe("Statistik admin", () => {
  it("menampilkan nilai nol dan nominal utuh dari props", () => {
    for (const value of ["0", "Rp 9.876.543.210"]) {
      const html = renderToStaticMarkup(
        <AdminStatCard
          icon={FolderKanban}
          label="Total Proyek"
          value={value}
          helper="Data sistem"
        />
      );
      expect(html).toContain(value);
      expect(html).toContain("Total Proyek");
      expect(html).toContain("Data sistem");
      expect(html).toContain('data-admin-icon-art="tech-web"');
      expect(html).not.toContain("<button");
    }
  });
});
