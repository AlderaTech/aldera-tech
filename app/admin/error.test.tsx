import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import AdminError from "./error";
describe("Error boundary admin", () => {
  it("menawarkan retry dan tidak mengungkap rincian internal", () => {
    const reset = mock();
    const element = AdminError({
      error: new Error("private database detail"),
      reset,
    });
    const html = renderToStaticMarkup(element);
    expect(html).toContain('role="alert"');
    expect(html).toContain("Coba lagi");
    expect(html).not.toContain("private database detail");
    expect(reset).not.toHaveBeenCalled();
  });
});
