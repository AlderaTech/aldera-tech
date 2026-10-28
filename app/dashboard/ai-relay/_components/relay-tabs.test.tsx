import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Tabs } from "@/components/ui/tabs";
import { VALID_RELAY_TABS } from "../_hooks/use-relay-workspace";
import { RELAY_SECTIONS } from "../_data/relay-sections";
import { RelayTabs } from "./relay-tabs";

describe("Navigasi AI Relay", () => {
  it("menjaga delapan nilai tab, urutan, dan satu penanda aktif", () => {
    expect(RELAY_SECTIONS.map(({ value }) => value)).toEqual([
      ...VALID_RELAY_TABS,
    ]);
    const html = renderToStaticMarkup(
      <Tabs value="catalog">
        <RelayTabs activeTab="catalog" />
      </Tabs>
    );
    expect(html.match(/role="tab"/g)).toHaveLength(8);
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Fitur AI Relay"');
    for (const { label } of RELAY_SECTIONS) {
      expect(html).toContain(label.replaceAll("&", "&amp;"));
    }
  });
  it("mempertahankan tab aktif untuk setiap tujuan URL", () => {
    for (const { value, label } of RELAY_SECTIONS) {
      const html = renderToStaticMarkup(
        <Tabs value={value}>
          <RelayTabs activeTab={value} />
        </Tabs>
      );
      expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
      const active = html.match(
        /<button[^>]*data-state="active"[^>]*>[\s\S]*?<\/button>/
      )?.[0];
      expect(active).toContain(label.replaceAll("&", "&amp;"));
    }
  });
});
