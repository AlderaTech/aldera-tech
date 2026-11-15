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
  describe("Authenticated file route", () => {
    it("preserves the access-controlled response and resolves asynchronous route params", async () => {
      const res = await GET(new Request("http://localhost/api/files/fixture"), {
        params: Promise.resolve({ id: "fixture" }),
      });
      expect(captured).toEqual({ id: "fixture" });
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
