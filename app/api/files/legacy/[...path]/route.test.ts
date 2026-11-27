import { describe, it, expect, mock } from "bun:test";
if (process.env.ALDERA_BACKEND_ROUTE_TEST_ISOLATED === "1") {
  let captured: unknown;
  mock.module("@/lib/file-download", () => ({
    downloadFile: async (where: unknown) => {
      captured = where;
      return new Response("Forbidden", { status: 403 });
    },
  }));
  const { GET } = await import("./route");
  describe("Legacy upload access boundary", () => {
    it("routes old public upload URLs through the same ownership policy", async () => {
      const res = await GET(
        new Request("http://localhost/uploads/2030/01/proof.pdf"),
        { params: Promise.resolve({ path: ["2030", "01", "proof.pdf"] }) }
      );
      expect(captured).toEqual({ path: "2030/01/proof.pdf" });
      expect(res.status).toBe(403);
    });
  });
} else {
  describe("Isolated route boundary", () => {
    it("runs route mocks without replacing integration dependencies", () => {
      const child = Bun.spawnSync(
        [process.execPath, "test", import.meta.path],
        {
          env: { ...process.env, ALDERA_BACKEND_ROUTE_TEST_ISOLATED: "1" },
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
