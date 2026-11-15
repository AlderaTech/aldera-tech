import { describe, expect, it } from "bun:test";
import { exportRangeSchema, resolveExportRange } from "./export-range";

describe("Timesheet export dates", () => {
  it("rejects malformed, nonexistent, and reversed calendar ranges", () => {
    for (const input of [
      { from: "invalid" },
      { from: "0000-01-01" },
      { from: "2026-02-30" },
      { from: "2026-13-01" },
      { to: "2026-02-29" },
      { from: "2026-11-16", to: "2026-10-16" },
    ])
      expect(exportRangeSchema.safeParse(input).success).toBe(false);
  });
  it("accepts leap days, same-day ranges, and omitted optional dates", () => {
    expect(
      exportRangeSchema.safeParse({ from: "2028-02-29", to: "2028-02-29" })
        .success
    ).toBe(true);
    expect(exportRangeSchema.safeParse({}).success).toBe(true);
    const now = new Date(2026, 10, 16, 12);
    expect(resolveExportRange({}, now)?.to).toEqual(now);
    expect(resolveExportRange({ from: "2027-01-01" }, now)).toBeNull();
  });
});
