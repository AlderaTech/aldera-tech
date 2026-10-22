import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { OnboardingCard } from "./onboarding-card";
import { steps } from "./_fixtures/overview";

describe("Kartu onboarding Ringkasan", () => {
  it("menampilkan seluruh langkah, progres, dan CTA langkah yang belum selesai", () => {
    const html = renderToStaticMarkup(
      <OnboardingCard steps={steps} completed={1} total={4} percent={25} />
    );
    expect(html).toContain('value="25"');
    expect(html).toContain("1 dari 4 langkah");
    expect(html.match(/<li\b/g)).toHaveLength(4);
    for (const step of steps) {
      expect(html).toContain(step.title);
      expect(html).toContain(step.description);
      if (!step.done) expect(html).toContain(`href="${step.cta.href}"`);
    }
    expect(html).toContain(": selesai");
    expect(html).toContain(": belum selesai");
    expect(html.match(/<a\b/g)).toHaveLength(3);
    expect(html.match(/data-next="true"/g)).toHaveLength(1);
    expect(html.match(/>Berikutnya</g)).toHaveLength(1);
    expect(html).toContain(
      'aria-label="Miliki proyek pertama: belum selesai" data-next="true"'
    );
    expect(html).toContain('aria-label="Ringkasan progres onboarding"');
  });
  it("menampilkan progres nol dan seluruh tindakan tanpa menambahkan langkah", () => {
    const allPending = steps.map((step) => ({ ...step, done: false }));
    const html = renderToStaticMarkup(
      <OnboardingCard steps={allPending} completed={0} total={4} percent={0} />
    );
    expect(html).toContain('value="0"');
    expect(html.match(/<a\b/g)).toHaveLength(4);
    expect(html).toContain(
      'aria-label="Lengkapi profil: belum selesai" data-next="true"'
    );
    expect(html.match(/>Berikutnya</g)).toHaveLength(1);
  });
});
