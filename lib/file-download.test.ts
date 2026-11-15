import { describe, it, expect, mock } from "bun:test";
import type { File as StoredFile, Role } from "@prisma/client";
import { resolve } from "node:path";
if (process.env.ALDERA_FILE_DOWNLOAD_TEST_ISOLATED === "1") {
  let user: { id: string; roles: Role[] } | null = null;
  let row: StoredFile | null = null,
    dbFailure = false,
    publicReference = false;
  mock.module("@/auth", () => ({ auth: async () => ({ user }) }));
  mock.module("@/lib/prisma", () => ({
    prisma: {
      file: {
        findFirst: async () => {
          if (dbFailure) throw new Error("test DB unavailable");
          return row;
        },
      },
      invoice: { findFirst: async () => ({ clientId: "owner" }) },
    },
  }));
  mock.module("@/lib/public-upload-classification", () => ({
    isPublicUploadReference: async () => publicReference,
  }));
  mock.module("@/lib/router-db", () => ({
    queryRouter: async () => ({ rows: [] }),
  }));
  mock.module("node:fs/promises", () => ({
    readFile: async () => Buffer.from("fixture-content"),
    realpath: async (path: string) => resolve(path),
  }));
  const { downloadFile } = await import("./file-download");
  const fixture: StoredFile = {
    id: "file",
    filename: "proof.pdf",
    originalName: "proof.pdf",
    mimeType: "application/pdf",
    size: 15,
    path: "2030/01/proof.pdf",
    url: "/uploads/2030/01/proof.pdf",
    scope: "INVOICE_PROOF",
    invoiceId: "invoice",
    topupId: null,
    projectId: null,
    uploaderId: "owner",
    createdAt: new Date(),
  };
  describe("File response privacy and path confinement", () => {
    it("denies unauthenticated or unrelated readers and never returns a publicly cacheable proof", async () => {
      row = { ...fixture };
      user = null;
      expect((await downloadFile({ id: "file" })).status).toBe(403);
      user = { id: "other", roles: ["CLIENT"] };
      expect((await downloadFile({ id: "file" })).status).toBe(403);
      user = { id: "owner", roles: ["CLIENT"] };
      const res = await downloadFile({ id: "file" });
      expect(res.status).toBe(200);
      expect(res.headers.get("Cache-Control")).toBe("private, no-store");
      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(res.headers.get("Content-Disposition")).toContain("attachment");
    });
    it("retains public media, checks legacy references, and rejects escaping paths", async () => {
      row = { ...fixture, scope: "PUBLIC_MEDIA" };
      user = null;
      expect((await downloadFile({ id: "file" })).status).toBe(200);
      row = { ...fixture, scope: "PRIVATE_LEGACY" };
      publicReference = true;
      expect((await downloadFile({ id: "file" })).status).toBe(200);
      row = { ...fixture, path: "../../secret.txt" };
      user = { id: "owner", roles: ["CLIENT"] };
      publicReference = false;
      expect((await downloadFile({ id: "file" })).status).toBe(404);
    });
    it("distinguishes missing metadata from an unavailable database", async () => {
      row = null;
      expect((await downloadFile({ id: "missing" })).status).toBe(404);
      dbFailure = true;
      try {
        expect((await downloadFile({ id: "file" })).status).toBe(503);
      } finally {
        dbFailure = false;
      }
    });
  });
} else {
  describe("Isolated download access tests", () => {
    it("runs filesystem and router mocks without leaking into the integration suite", () => {
      const result = Bun.spawnSync(
        [process.execPath, "test", import.meta.path],
        {
          env: { ...process.env, ALDERA_FILE_DOWNLOAD_TEST_ISOLATED: "1" },
          stdout: "pipe",
          stderr: "pipe",
        }
      );
      if (result.exitCode !== 0)
        throw new Error(result.stderr.toString() + result.stdout.toString());
      expect(result.exitCode).toBe(0);
    });
  });
}
