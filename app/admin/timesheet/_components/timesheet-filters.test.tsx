import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { API_ROUTES } from "@/lib/routes";
import { TimesheetFilters } from "./timesheet-filters";

describe("Toolbar tanggal Timesheet", () => {
  it("mempertahankan GET, nama field, tanggal awal dan URL unduhan CSV", () => {
    const from = "2026-10-31",
      to = "2026-11-02";
    const html = renderToStaticMarkup(<TimesheetFilters from={from} to={to} />);
    expect(html).toContain('method="get"');
    expect(html).toContain('aria-label="Filter rentang tanggal"');
    for (const [name, value] of [
      ["from", from],
      ["to", to],
    ]) {
      expect(html).toContain('id="' + name + '"');
      expect(html).toContain('name="' + name + '"');
      expect(html).toContain('value="' + value + '"');
      expect(html).toContain('for="' + name + '"');
    }
    expect(html).toContain('type="submit"');
    expect(html).toContain(
      API_ROUTES.exportTimesheetWithRange(from, to).replaceAll("&", "&amp;")
    );
    expect(html).toContain("download");
    expect(html).toContain("(Opsional)");
    expect(html).toContain('placeholder="Tanggal mulai"');
  });
  it("mempertahankan nilai kosong dan kontrol responsif tanpa menambah validasi atau perhitungan", () => {
    const html = renderToStaticMarkup(<TimesheetFilters from="" to="" />);
    expect(html.match(/value=""/g)).toHaveLength(2);
    expect(html).not.toContain("required");
    const css = readFileSync(
      new URL("./timesheet-filters.module.css", import.meta.url),
      "utf8"
    );
    expect(css).toContain("height: 44px");
    expect(css).toContain("border-radius: 999px");
    expect(css).toContain("@container (max-width: 44rem)");
  });
});
