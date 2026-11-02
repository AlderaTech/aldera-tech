import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Tabs } from "@/components/ui/tabs";
import {
  WorkspaceTabsList,
  WorkspaceTabsTrigger,
} from "./workspace-segmented-tabs";
describe("Navigasi segmented ruang kerja", () => {
  it("membatasi kepadatan compact pada pemanggil yang memintanya", () => {
    const compact = renderToStaticMarkup(
      <Tabs value="catalog">
        <WorkspaceTabsList density="compact">
          <WorkspaceTabsTrigger value="catalog">Katalog</WorkspaceTabsTrigger>
        </WorkspaceTabsList>
      </Tabs>
    );
    const standard = renderToStaticMarkup(
      <Tabs value="catalog">
        <WorkspaceTabsList>
          <WorkspaceTabsTrigger value="catalog">Katalog</WorkspaceTabsTrigger>
        </WorkspaceTabsList>
      </Tabs>
    );
    expect(compact).toContain('data-density="compact"');
    expect(standard).not.toContain("data-density");
    expect(compact.match(/aria-selected="true"/g)).toHaveLength(1);
  });
  for (const count of [4, 5, 8])
    it("mempertahankan " + count + " tab dan satu pilihan aktif", () => {
      const html = renderToStaticMarkup(
        <Tabs value="tab-2">
          <WorkspaceTabsList aria-label="Pilihan modul">
            {Array.from({ length: count }, (_, i) => (
              <WorkspaceTabsTrigger
                key={i}
                value={"tab-" + i}
                disabled={i === 0}
              >
                Modul {i}
              </WorkspaceTabsTrigger>
            ))}
          </WorkspaceTabsList>
        </Tabs>
      );
      expect(html).toContain('data-tab-count="' + count + '"');
      expect(html.match(/role="tab"/g)).toHaveLength(count);
      expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
      expect(html).toContain('aria-label="Pilihan modul"');
      expect(html).toContain("disabled");
    });
  it("meneruskan callback keyboard/fokus dan referensi tanpa mengganti state", () => {
    const onFocus = mock(),
      ref = { current: null };
    const list = WorkspaceTabsList({ children: [], onFocus, ref });
    const trigger = WorkspaceTabsTrigger({
      value: "catalog",
      onFocus,
      "aria-label": "Katalog",
    });
    expect(list.props.children.props.onFocus).toBe(onFocus);
    expect(list.props.children.props.ref).toBe(ref);
    expect(trigger.props.onFocus).toBe(onFocus);
    expect(onFocus).not.toHaveBeenCalled();
  });
});
