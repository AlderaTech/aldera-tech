import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../_test-utils/page-mocks";
installAdminPageMocks();
const { BlogForm } = await import("./blog-form");
describe("Editor blog admin", () => {
  it("menampilkan input dan tindakan simpan pada mode baru maupun edit", () => {
    for (const initial of [
      undefined,
      {
        id: "post-ui",
        title: "Judul Asli",
        slug: "judul-asli",
        excerpt: "Ringkasan asli",
        content: "<p>Isi asli</p>",
        published: false,
      },
    ]) {
      const html = renderToStaticMarkup(
        <BlogForm
          initial={initial}
          categories={[{ id: "cat-ui", name: "Engineering" }]}
        />
      );
      expect(html).toContain("Judul");
      expect(html).toContain("Slug");
      expect(html).toContain("Excerpt");
      expect(html).toContain("Simpan");
      expect(html).toContain("Featured Image");
      if (initial) expect(html).toContain("Judul Asli");
    }
  });
});
