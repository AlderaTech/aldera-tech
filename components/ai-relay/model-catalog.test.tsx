import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { ModelCatalogItem } from "@/lib/ai-relay-utils";
import { ModelCatalog } from "./model-catalog";

describe("Katalog model setelah pemisahan toolbar", () => {
  it("mempertahankan empty state dan kontrol tanpa memanggil aksi saat render", () => {
    const onPlayground = mock();
    const html = renderToStaticMarkup(
      <ModelCatalog
        catalog={[]}
        apiKeys={[]}
        onSelectPlaygroundModel={onPlayground}
      />
    );
    expect(html).toContain("Tidak ada model yang cocok");
    expect(html).toContain("data-relay-catalog-toolbar");
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(onPlayground).not.toHaveBeenCalled();
  });
  it("mempertahankan ID lengkap, harga, konteks dan seluruh model aktif pada daftar panjang", () => {
    const catalog: ModelCatalogItem[] = Array.from({ length: 48 }, (_, i) => ({
      id: `provider/model-${i}-${"id-panjang-".repeat(12)}`,
      displayName: `Model uji ${i}`,
      category: "Coding",
      contextWindow: 128000,
      inputPricePerM: 12345,
      outputPricePerM: 67890,
      bestFor: "Fixture UI",
      isActive: i !== 0,
    }));
    const html = renderToStaticMarkup(
      <ModelCatalog
        catalog={catalog}
        apiKeys={[]}
        onSelectPlaygroundModel={mock()}
      />
    );
    expect(html.match(/data-relay-model-card/g)).toHaveLength(47);
    expect(html).toContain(`title="${catalog[47].id}"`);
    expect(html).toContain("12.345");
    expect(html).toContain("67.890");
    expect(html).toContain("128.000");
    expect(html).toContain("/ 1M token");
    expect(html).not.toContain(`title="${catalog[0].id}"`);
  });
});
