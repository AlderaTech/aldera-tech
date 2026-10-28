import { describe, expect, it, mock } from "bun:test";
import { existsSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { formatCurrency } from "@/lib/utils";
import { RelayHeader } from "./relay-header";

describe("Header workspace AI Relay", () => {
  it("mempertahankan saldo asli termasuk nol dan tombol top-up", () => {
    for (const balance of [0, 150000, 1234567890123]) {
      const html = renderToStaticMarkup(
        <RelayHeader balance={balance} onTopup={mock()} />
      );
      expect(html).toContain('aria-labelledby="relay-heading"');
      expect(html).toContain("Aldera AI API Relay");
      expect(html).toContain("data-relay-balance");
      expect(html).toContain("data-relay-balance-panel");
      expect(html).toContain(formatCurrency(balance));
      expect(html.match(/<button\b/g)).toHaveLength(1);
      expect(html).toContain("Top-up Saldo");
      expect(html).not.toMatch(/Online|100%/);
    }
  });

  it("menggunakan maskot koneksi yang tersedia sebagai dekorasi kecil", () => {
    const html = renderToStaticMarkup(
      <RelayHeader balance={0} onTopup={mock()} />
    );
    expect(
      existsSync(
        new URL(
          "../../../../public/images/dashboard/ai-relay/aldera-relay-connect.webp",
          import.meta.url
        )
      )
    ).toBe(true);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('alt=""');
    expect(html.match(/<img\b/g)).toHaveLength(1);
  });
});
