import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ModelCatalogToolbar } from "./model-catalog-toolbar";

describe("Toolbar katalog model", () => {
  it("mempertahankan enam kategori, pencarian berlabel, nilai input, dan satu filter aktif", () => {
    for (const selectedCategory of [
      "All",
      "Coding",
      "Reasoning",
      "Vision",
      "Fast",
      "Budget",
    ] as const) {
      const html = renderToStaticMarkup(
        <ModelCatalogToolbar
          selectedCategory={selectedCategory}
          searchQuery="model & ID panjang"
          onCategoryChange={mock()}
          onSearchChange={mock()}
        />
      );
      expect(html.match(/<button\b/g)).toHaveLength(6);
      expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
      expect(html).toContain('aria-label="Cari model, ID, atau kegunaan"');
      expect(html).toContain('placeholder="Cari model, ID, atau kegunaan..."');
      expect(html).toContain('value="model &amp; ID panjang"');
      expect(html).toContain("data-relay-catalog-toolbar");
      expect(html).toContain("data-relay-search");
    }
  });
  it("meneruskan kategori dan query utuh kepada state asli tanpa efek samping saat render", () => {
    const onCategoryChange = mock(),
      onSearchChange = mock();
    const toolbar = ModelCatalogToolbar({
      selectedCategory: "All",
      searchQuery: "",
      onCategoryChange,
      onSearchChange,
    });
    expect(onCategoryChange).not.toHaveBeenCalled();
    expect(onSearchChange).not.toHaveBeenCalled();
    const [categories, search] = toolbar.props.children;
    categories.props.children[1].props.onClick();
    search.props.children[1].props.onChange({
      target: { value: "provider/model-id lengkap" },
    });
    expect(onCategoryChange).toHaveBeenCalledWith("Coding");
    expect(onSearchChange).toHaveBeenCalledWith("provider/model-id lengkap");
  });
});
