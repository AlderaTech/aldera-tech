import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../_test-utils/page-mocks";
import { ADMIN_ROUTES } from "@/lib/routes";
installAdminPageMocks();
const { PortfolioForm } = await import("./portfolio-form");
describe("Editor portfolio", () => {
  it("mempertahankan mode publikasi dan pembaruan serta route daftar", () => {
    const create = renderToStaticMarkup(<PortfolioForm />);
    const edit = renderToStaticMarkup(
      <PortfolioForm
        initial={{
          id: "case-ui",
          title: "Proyek Asli",
          slug: "proyek-asli",
          client: "Client Uji",
          industry: "Teknologi",
          summary: "Ringkasan asli",
          challenge: "Tantangan asli",
          solution: "Solusi asli",
          result: "Hasil asli",
          techStack: ["TypeScript"],
          published: false,
          order: 2,
        }}
      />
    );
    expect(create).toContain("Terbitkan Studi Kasus");
    expect(edit).toContain("Simpan Perubahan");
    expect(edit).toContain("Proyek Asli");
    expect(edit).toContain('href="' + ADMIN_ROUTES.portfolio + '"');
  });
});
