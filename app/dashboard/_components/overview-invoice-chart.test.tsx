import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { OverviewInvoiceChart } from "./overview-invoice-chart";

it("uses the same invoice-count denominator and zero-height empty bars", () => {
  const html = renderToStaticMarkup(
    <OverviewInvoiceChart
      active={3}
      spent={10000}
      data={{ paid: 2, waiting: 1, verification: 1 }}
    />
  );
  expect(html).toContain("height:50%");
  expect(html).toContain("Proporsi jumlah dari 4 invoice terbit");
  const empty = renderToStaticMarkup(
    <OverviewInvoiceChart
      active={0}
      spent={0}
      data={{ paid: 0, waiting: 0, verification: 0 }}
    />
  );
  expect(empty).toContain("height:0%");
  expect(empty).not.toContain("Semua lunas");
});
