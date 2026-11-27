import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { OverviewActivityDialog } from "./overview-activity-dialog";

describe("Dialog aktivitas yang dapat diakses", () => {
  it("menyediakan pemicu keyboard dan tidak mengekspos isi dialog yang masih tertutup", () => {
    const html = renderToStaticMarkup(
      <OverviewActivityDialog count={6}>
        <p>Riwayat lengkap</p>
      </OverviewActivityDialog>
    );
    expect(html).toContain("Lihat lebih lanjut");
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain("Riwayat lengkap");
    expect(html).not.toContain('role="dialog"');
  });
  it("menggunakan primitive dialog dengan fokus, Escape dan pengembalian fokus standar", () => {
    const source = readFileSync(
      new URL("./overview-activity-dialog.tsx", import.meta.url),
      "utf8"
    );
    expect(source).toContain("<Dialog open={open} onOpenChange={setOpen}>");
    expect(source).toContain("<DialogTrigger asChild>");
    expect(source).toContain("<DialogContent");
    expect(source).toContain("<DialogDescription");
    expect(source).not.toContain('window.addEventListener("keydown"');
    expect(source).not.toContain('role="dialog"');
  });
});
