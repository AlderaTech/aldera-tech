import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { installAdminPageMocks } from "../../_test-utils/page-mocks";
installAdminPageMocks();
const { TestimonialManagement } = await import("./testimonial-management");
describe("Banner testimoni admin", () => {
  it("menjaga tindakan asli dan kondisi daftar kosong", () => {
    const html = renderToStaticMarkup(
      <TestimonialManagement testimonials={[]} completedProjects={[]} />
    );
    expect(html).toContain("data-workspace-banner-badge");
    expect(html).toContain("data-admin-page-header");
    expect(html).toContain("Testimoni");
    expect(html).toContain("data-admin-empty");
  });
});
