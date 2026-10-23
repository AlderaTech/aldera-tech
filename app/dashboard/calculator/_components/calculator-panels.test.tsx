import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { StepProjectType } from "@/app/(public)/pricing/_components/calculator-steps/step-project-type";
import { StepDetails } from "@/app/(public)/pricing/_components/calculator-steps/step-details";
import { StepFeatures } from "@/app/(public)/pricing/_components/calculator-steps/step-features";
import { StepAddOns } from "@/app/(public)/pricing/_components/calculator-steps/step-addons";
import { StepReview } from "@/app/(public)/pricing/_components/calculator-steps/step-review";
import type { ProjectType } from "@/app/(public)/pricing/_types/calculator";

const noop = () => {};
const project: ProjectType = {
  id: "project-type-test",
  name: "Web App",
  slug: "web-app",
  description: "Deskripsi pengujian tampilan pilihan proyek.",
  basePrice: 5000000,
  icon: "code2",
  dependentFields: [],
  order: 0,
};

describe("Panel konfigurasi Kalkulator dashboard", () => {
  it("membatasi permukaan dan kontras baru pada varian dashboard", () => {
    const css = readFileSync(
      new URL(
        "../../../(public)/pricing/_components/calculator-dashboard.module.css",
        import.meta.url
      ),
      "utf8"
    );
    const page = readFileSync(
      new URL("./calculator-page.module.css", import.meta.url),
      "utf8"
    );
    expect(css).toContain(".dashboard.wizard");
    expect(css).toContain("align-items: start;");
    expect(css).toContain("var(--overview-line) 35%");
    const summary = css.match(/\.dashboard \.summaryCard \{([^}]+)\}/)?.[1];
    expect(summary).toContain("background: var(--overview-paper);");
    expect(summary).not.toContain("linear-gradient");
    expect(css).toContain(".summaryDetails > div:last-child");
    expect(css).toContain(".dashboard .summaryFooter");
    expect(page).toContain("var(--overview-ink) 18%");
    expect(page).toContain("var(--overview-ink) 72%");
    expect(css).not.toMatch(/:global|(?:^|\n)(?:body|html)\b/);
  });

  it("mempertahankan pilihan Jenis dan validasi Skala", () => {
    const types = renderToStaticMarkup(
      <StepProjectType
        dashboard
        projectTypes={[project]}
        selectedType=""
        onSelectType={noop}
        onNext={noop}
      />
    );
    expect(types).toContain('aria-pressed="false"');
    expect(types).toContain('tabindex="0"');
    expect(types).toContain("Web App");
    expect(types).toMatch(/<button[^>]+disabled/);
    const scale = renderToStaticMarkup(
      <StepDetails
        dashboard
        pt={project}
        depFields={[
          {
            label: "Modul",
            type: "number",
            pricePerUnit: 100000,
            unit: "modul",
            min: 1,
          },
        ]}
        depValues={{}}
        onDepValueChange={noop}
        onBack={noop}
        onNext={noop}
      />
    );
    expect(scale).toContain("data-scale-field");
    expect(scale).toContain('placeholder="Jumlah modul (misal 1)"');
    expect(scale).toContain('aria-describedby="scale-validation"');
    expect(scale).toContain('id="field-Modul"');
    expect(scale).toMatch(/<button[^>]+disabled/);
  });

  it("mempertahankan pilihan Fitur, Add-on, dan nilai durasi", () => {
    const features = renderToStaticMarkup(
      <StepFeatures
        dashboard
        availableFeatures={[
          {
            id: "feature",
            name: "Login",
            description: null,
            price: 500000,
            isMajor: false,
            disclaimer: null,
            projectTypeId: project.id,
          },
        ]}
        selectedFeatures={["feature"]}
        onToggleFeature={noop}
        customFeatures={[{ name: "Integrasi khusus", description: "" }]}
        onCustomFeaturesChange={noop}
        config={null}
        onBack={noop}
        onNext={noop}
      />
    );
    expect(features).toContain('data-state="checked"');
    expect(features).toContain("data-feature-list");
    expect(features).toContain('value="Integrasi khusus"');
    const addons = renderToStaticMarkup(
      <StepAddOns
        dashboard
        availableAddOns={[
          {
            id: "addon",
            name: "Hosting",
            description: null,
            pricePerMonth: 100000,
            minMonths: 1,
            maxMonths: 12,
            projectTypeId: project.id,
          },
        ]}
        selectedAddOns={{ addon: 3 }}
        onAddOnChange={noop}
        urgency="normal"
        onUrgencyChange={noop}
        config={null}
        onBack={noop}
        onNext={noop}
      />
    );
    expect(addons).toContain("data-addon=");
    expect(addons).toContain('id="addon-addon"');
    expect(addons).toContain('value="3"');
    expect(addons).toContain('aria-pressed="true"');
    expect(addons).toContain('aria-pressed="false"');
  });

  it("mempertahankan isi dan status pengajuan pada Review", () => {
    const review = renderToStaticMarkup(
      <StepReview
        dashboard
        config={null}
        notes="Catatan pengguna tetap tersedia"
        onNotesChange={noop}
        deadline="2026-12-01"
        onDeadlineChange={noop}
        isAuthenticated
        pending
        total={5000000}
        ptName={project.name}
        onBack={noop}
        onSubmit={noop}
      />
    );
    expect(review).toContain('href="#calculator-estimate"');
    expect(review).toContain("data-review-project");
    expect(review).toContain("Catatan pengguna tetap tersedia");
    expect(review).toContain('value="2026-12-01"');
    expect(review).toContain('aria-busy="true"');
    expect(review).toContain("Mengajukan...");
    expect(review).toMatch(/<button[^>]+disabled/);
  });
});
