import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { usePreviewSelection } from "./use-preview-selection";

function Preview({ initial }: { initial: string }) {
  const preview = usePreviewSelection(initial);
  return (
    <output
      data-selected={preview.selectedId}
      data-draft={preview.draftId}
      data-open={preview.open}
    />
  );
}
describe("Pilihan lokal preview", () => {
  it("memulai pilihan dan draft dari opsi contoh yang sama, dengan dialog tertutup", () => {
    const html = renderToStaticMarkup(<Preview initial="demo-bank" />);
    expect(html).toContain('data-selected="demo-bank"');
    expect(html).toContain('data-draft="demo-bank"');
    expect(html).toContain('data-open="false"');
  });
  it("menerima daftar kosong tanpa membuat identitas metode baru", () => {
    expect(renderToStaticMarkup(<Preview initial="" />)).toContain(
      'data-selected=""'
    );
  });
});
