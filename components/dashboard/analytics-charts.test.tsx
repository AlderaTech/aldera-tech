import { describe, expect, it } from "bun:test";
import { Children, isValidElement, type ReactNode } from "react";
import { Area, Pie } from "recharts";
import { RevenueAreaChart, ProjectStatusPie } from "./analytics-charts";
function animation(node: ReactNode, type: unknown): boolean | undefined {
  for (const child of Children.toArray(node)) {
    if (
      !isValidElement<{ children?: ReactNode; isAnimationActive?: boolean }>(
        child
      )
    )
      continue;
    if (child.type === type) return child.props.isAnimationActive;
    const found = animation(child.props.children, type);
    if (found !== undefined) return found;
  }
}
describe("Opsi animasi grafik", () => {
  it("mempertahankan perilaku default untuk pemakai di luar Admin", () => {
    expect(
      animation(
        RevenueAreaChart({ data: [{ month: "Jan", revenue: 1 }] }),
        Area
      )
    ).toBe(true);
    expect(
      animation(ProjectStatusPie({ data: [{ name: "Aktif", value: 1 }] }), Pie)
    ).toBe(true);
  });
  it("dapat mematikan animasi admin agar angka dan grafik langsung tampil", () => {
    expect(
      animation(
        RevenueAreaChart({
          data: [{ month: "Jan", revenue: 1 }],
          animate: false,
        }),
        Area
      )
    ).toBe(false);
    expect(
      animation(
        ProjectStatusPie({
          data: [{ name: "Aktif", value: 1 }],
          animate: false,
        }),
        Pie
      )
    ).toBe(false);
  });
});
