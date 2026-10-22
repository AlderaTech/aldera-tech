import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { OnboardingPieChart } from "./onboarding-pie-chart";

describe("Pie chart progres onboarding", () => {
  it("menggunakan persentase dan jumlah langkah asli untuk chart serta legenda", () => {
    const html = renderToStaticMarkup(
      <OnboardingPieChart completed={1} total={4} percent={25} />
    );
    expect(html).toContain('stroke-dasharray="25 75"');
    expect(html).toContain('pathLength="100"');
    expect(html).toContain('value="25" max="100"');
    expect(html).toContain('aria-label="Progres onboarding"');
    expect(html).toMatch(/Selesai <strong>1<\/strong>/);
    expect(html).toMatch(/Belum selesai <strong>3<\/strong>/);
    expect(html).toContain('aria-hidden="true"');
  });

  it("menampilkan progres nol tanpa menggambar irisan kemajuan buatan", () => {
    const html = renderToStaticMarkup(
      <OnboardingPieChart completed={0} total={4} percent={0} />
    );
    expect(html).not.toContain("stroke-dasharray");
    expect(html).toContain('value="0"');
    expect(html).toMatch(/Belum selesai <strong>4<\/strong>/);
  });

  it("mendukung seluruh langkah selesai dan jumlah langkah kosong", () => {
    const complete = renderToStaticMarkup(
      <OnboardingPieChart completed={4} total={4} percent={100} />
    );
    expect(complete).toContain('stroke-dasharray="100 0"');
    expect(complete).toMatch(/Belum selesai <strong>0<\/strong>/);
    const empty = renderToStaticMarkup(
      <OnboardingPieChart completed={0} total={0} percent={0} />
    );
    expect(empty).not.toContain("stroke-dasharray");
    expect(empty).not.toMatch(/NaN|Infinity/);
  });
});
