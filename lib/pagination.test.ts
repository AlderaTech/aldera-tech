import { expect, it } from "bun:test";
import { parsePage, parsePageSize } from "./pagination";

it("normalizes malformed, fractional, non-finite and overflowing pages", () => {
  for (const value of [
    undefined,
    "abc",
    "Infinity",
    "NaN",
    "1.55",
    "0",
    "-1",
    "999999999999999999999999",
    {},
    [],
  ])
    expect(parsePage(value)).toBe(1);
  expect(parsePage("2")).toBe(2);
  expect(parsePage("99999")).toBe(10_000);
});
it("bounds page sizes without silently coercing invalid values", () => {
  expect(parsePageSize(3)).toBe(3);
  for (const value of [Infinity, 0, 101, 1.5, "bad"])
    expect(parsePageSize(value, 9)).toBe(9);
});
