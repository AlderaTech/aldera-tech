import { describe, expect, it } from "bun:test";
import { Children, isValidElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { OverviewStats } from "./overview-stats";
import { OverviewCounter } from "./overview-counter";

function counters(node: ReactNode): { value?: number; currency?: boolean }[] {
  return Children.toArray(node).flatMap((child) => {
    if (
      !isValidElement<{
        children?: ReactNode;
        value?: number;
        currency?: boolean;
      }>(child)
    )
      return [];
    if (child.type === OverviewCounter)
      return [{ value: child.props.value, currency: child.props.currency }];
    return counters(child.props.children);
  });
}

describe("Statistik Ringkasan", () => {
  it("mempertahankan ketiga nilai asli dan penanda rupiah tanpa menghitung ulang", () => {
    expect(
      counters(OverviewStats({ active: 3, pending: 2, spent: 1234567.89 }))
    ).toEqual([
      { value: 3, currency: undefined },
      { value: 2, currency: undefined },
      { value: 1234567.89, currency: true },
    ]);
  });
  it("merender label serta nilai nol tanpa tren dan statistik tambahan", () => {
    const html = renderToStaticMarkup(
      <OverviewStats active={0} pending={0} spent={0} />
    );
    expect(html.match(/<article\b/g)).toHaveLength(3);
    for (const label of ["Proyek Aktif", "Invoice Pending", "Total Dibayarkan"])
      expect(html).toContain(label);
    expect(
      counters(OverviewStats({ active: 0, pending: 0, spent: 0 })).map(
        (item) => item.value
      )
    ).toEqual([0, 0, 0]);
  });
});
