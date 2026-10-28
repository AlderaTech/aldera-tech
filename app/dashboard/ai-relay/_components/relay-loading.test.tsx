import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { RelayLoading } from "./relay-loading";

describe("Skeleton workspace AI Relay", () => {
  it("menyediakan status pemuatan, delapan slot navigasi, dan enam kartu", () => {
    const html = renderToStaticMarkup(<RelayLoading />);
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Memuat AI Relay"');
    expect(html.match(/data-slot="card"/g)).toHaveLength(6);
    expect(html).toContain("data-relay-model-grid");
    expect(
      (html.match(/data-slot="skeleton"/g) || []).length
    ).toBeGreaterThanOrEqual(12);
    expect(html).not.toContain("Top-up Saldo");
  });
});
