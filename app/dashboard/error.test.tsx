import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import ErrorView from "./error";
it("shows a retry instead of an empty successful result", () => {
  const reset = () => {};
  const html = renderToStaticMarkup(<ErrorView reset={reset} />);
  expect(html).toContain('role="alert"');
  expect(html).toContain("Coba lagi");
  expect(html).not.toContain("Semua tagihan lunas");
});
