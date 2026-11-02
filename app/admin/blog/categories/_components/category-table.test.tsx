import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { CategoryTable } from "./category-table";
describe("Empty state kategori blog", () => {
  it("menjaga petunjuk sesuai hak membuat kategori", () => {
    for (const canCreate of [true, false]) {
      const html = renderToStaticMarkup(
        <CategoryTable
          categories={[]}
          permissions={{ canCreate, canEdit: false, canDelete: false }}
          onEdit={mock()}
          onDelete={mock()}
        />
      );
      expect(html).toContain("data-admin-empty");
      expect(html).toContain("Belum ada kategori blog");
      expect(html.includes("Buat kategori pertama")).toBe(canCreate);
    }
  });
  it("membatasi tombol kategori baru pada izin dan callback yang tersedia", () => {
    const onCreate = mock();
    for (const canCreate of [true, false]) {
      const html = renderToStaticMarkup(
        <CategoryTable
          categories={[]}
          permissions={{ canCreate, canEdit: false, canDelete: false }}
          onCreate={onCreate}
          onEdit={mock()}
          onDelete={mock()}
        />
      );
      expect(html.includes("Kategori Baru")).toBe(canCreate);
    }
    expect(onCreate).not.toHaveBeenCalled();
  });
});
