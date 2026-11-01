import { describe, it, expect } from "bun:test";
import { toCsv, csvResponse } from "./csv";

describe("lib/csv.ts unit test suite", () => {
  it("returns empty string when rows are empty and no fields provided", () => {
    expect(toCsv([])).toBe("");
  });

  it("returns header row when rows are empty but fields are explicitly provided", () => {
    expect(toCsv([], ["name", "email", "amount"])).toBe("name,email,amount\n");
  });

  it("generates csv from simple objects with inferred fields", () => {
    const data = [
      { id: "1", name: "Alice", score: 95 },
      { id: "2", name: "Bob", score: 80 },
    ];
    const csv = toCsv(data);
    expect(csv).toBe("id,name,score\n1,Alice,95\n2,Bob,80");
  });

  it("respects explicit fields selection and ordering", () => {
    const data = [
      { id: "1", name: "Alice", internalSecret: "xyz" },
      { id: "2", name: "Bob", internalSecret: "abc" },
    ];
    const csv = toCsv(data, ["name", "id"]);
    expect(csv).toBe("name,id\nAlice,1\nBob,2");
  });

  it("escapes fields containing commas, quotes, and newlines properly (RFC 4180)", () => {
    const data = [
      {
        text: 'He said, "Hello World!"',
        multiline: "Line 1\nLine 2",
        crlf: "A\r\nB",
      },
    ];
    const csv = toCsv(data);
    expect(csv).toContain('"He said, ""Hello World!"""');
    expect(csv).toContain('"Line 1\nLine 2"');
    expect(csv).toContain('"A\r\nB"');
  });

  it("formats Date objects as ISO strings and handles null/undefined as empty", () => {
    const now = new Date("2026-11-01T12:00:00.000Z");
    const data = [
      {
        createdAt: now,
        emptyVal: null,
        missingVal: undefined,
      },
    ];
    const csv = toCsv(data);
    expect(csv).toBe(
      "createdAt,emptyVal,missingVal\n2026-11-01T12:00:00.000Z,,"
    );
  });

  it("creates HTTP Response with UTF-8 BOM, headers, and filename", async () => {
    const csvContent = "id,name\n1,Aldera";
    const res = csvResponse(csvContent, "report-2026.csv");

    expect(res.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
    expect(res.headers.get("Content-Disposition")).toBe(
      'attachment; filename="report-2026.csv"'
    );
    expect(res.headers.get("Cache-Control")).toBe("no-store");

    const text = await res.text();
    // Checks that text starts with BOM \uFEFF
    expect(text.charCodeAt(0)).toBe(0xfeff);
    expect(text.slice(1)).toBe(csvContent);
  });
});
