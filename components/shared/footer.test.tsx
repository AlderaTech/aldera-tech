import { expect, it } from "bun:test";

it("renders the public footer with default branding when the database is unavailable", () => {
  const script = `
    import assert from "node:assert/strict";
    import { mock } from "bun:test";
    import { renderToStaticMarkup } from "react-dom/server";

    mock.module("server-only", () => ({}));
    mock.module("@/lib/prisma", () => ({
      prisma: {
        siteSetting: {
          findUnique: async () => {
            throw new Error("database unavailable");
          },
        },
      },
    }));

    const { Footer } = await import("./components/shared/footer.tsx");
    const html = renderToStaticMarkup(await Footer());

    assert.ok(html.includes("Aldera Tech"));
    assert.ok(html.includes("Partner teknologi untuk bisnis modern."));
  `;
  const result = Bun.spawnSync([process.execPath, "-e", script]);

  if (result.exitCode !== 0) {
    throw new Error(result.stderr.toString());
  }

  expect(result.exitCode).toBe(0);
});
