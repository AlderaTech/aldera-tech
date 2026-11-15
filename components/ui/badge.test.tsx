import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Badge } from "./badge";

describe("Badge dan penanda varian", () => {
  it("meneruskan label status, atribut aksesibilitas dan varian untuk styling workspace", () => {
    for (const variant of [
      "default",
      "secondary",
      "success",
      "warning",
      "destructive",
      "outline",
    ] as const) {
      const html = renderToStaticMarkup(
        <Badge variant={variant} aria-label="Status proyek">
          Status asli
        </Badge>
      );
      expect(html).toContain('data-variant="' + variant + '"');
      expect(html).toContain('aria-label="Status proyek"');
      expect(html).toContain("Status asli");
    }
    expect(renderToStaticMarkup(<Badge>0</Badge>)).toContain(
      'data-variant="default"'
    );
  });
});
