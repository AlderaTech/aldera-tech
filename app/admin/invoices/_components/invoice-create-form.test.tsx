import { describe, it, expect, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
if (process.env.ALDERA_UI_BOUNDARY_TEST_ISOLATED === "1") {
  mock.module("next/navigation", () => ({
    useRouter: () => ({ push: mock(), refresh: mock() }),
  }));
  mock.module("@/lib/actions/invoice", () => ({ createInvoiceAction: mock() }));
  const { InvoiceCreateForm } = await import("./invoice-create-form");
  describe("Explicit invoice purpose", () => {
    it("renders a labeled purpose selector and retains client, dates and item fields", () => {
      const html = renderToStaticMarkup(
        <InvoiceCreateForm clients={[]} projects={[]} />
      );
      expect(html).toContain("Tujuan tagihan");
      expect(html).toContain('id="invoice-purpose"');
      expect(html).toContain('id="invoice-client"');
      expect(html).toContain("Tanggal");
    });
  });
} else {
  describe("Isolated UI boundary", () => {
    it("checks rendering without replacing other components or actions", () => {
      const child = Bun.spawnSync(
        [process.execPath, "test", import.meta.path],
        {
          env: { ...process.env, ALDERA_UI_BOUNDARY_TEST_ISOLATED: "1" },
          stdout: "pipe",
          stderr: "pipe",
        }
      );
      if (child.exitCode !== 0)
        throw new Error(child.stderr.toString() + child.stdout.toString());
      expect(child.exitCode).toBe(0);
    });
  });
}
