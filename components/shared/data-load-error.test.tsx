import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { DataLoadError } from "./data-load-error";

it("offers an accessible retry instead of showing empty data or private errors", () => {
  const html = renderToStaticMarkup(<DataLoadError reset={() => {}} />);
  expect(html).toContain('role="alert"');
  expect(html).toContain("Data belum dapat dimuat");
  expect(html).toContain("Coba lagi");
  expect(html).not.toContain("Belum ada");
});
