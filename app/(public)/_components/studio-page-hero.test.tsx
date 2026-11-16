import { expect, it } from "bun:test";
import { CircleHelp } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { StudioPageHero } from "./studio-page-hero";

it("uses a semantic heading and icon badge without the legacy serif theme", () => {
  const html = renderToStaticMarkup(
    <StudioPageHero
      label="FAQ"
      title="Pertanyaan Anda"
      description="Temukan jawabannya."
      icon={CircleHelp}
    />
  );
  expect(html).toContain("<h1");
  expect(html).toContain("FAQ / Aldera Tech");
  expect(html).toContain('aria-hidden="true"');
  expect(html).not.toContain("editorial-display");
});
