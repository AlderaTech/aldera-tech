import { describe, it, expect, mock, beforeEach } from "bun:test";
import { NextRequest } from "next/server";
import type { Role } from "@prisma/client";

type MockSession = {
  user: {
    id: string;
    roles?: Role[];
    role?: Role;
    name?: string;
    email?: string;
  };
} | null;

let currentSession: MockSession = null;

mock.module("server-only", () => ({}));

mock.module("@/auth", () => ({
  auth: mock(async () => currentSession),
  handlers: {},
  signIn: mock(),
  signOut: mock(),
}));

mock.module("@/lib/notifications", () => ({
  notify: mock(async () => ({ success: true })),
}));

const mockWriteFile = mock(async () => {});
const mockMkdir = mock(async () => {});

mock.module("node:fs/promises", () => ({
  writeFile: mockWriteFile,
  mkdir: mockMkdir,
  unlink: mock(async () => {}),
}));

import { getTestPrisma } from "@/lib/test-prisma";
const prisma = getTestPrisma();
mock.module("@/lib/prisma", () => ({
  prisma,
  default: prisma,
}));

const { POST } = await import("./route");

describe("AT-L9: app/api/upload/route.ts test suite", () => {
  const staffUserId = "staff_uploader_1";

  beforeEach(async () => {
    mockWriteFile.mockReset();
    mockMkdir.mockReset();

    await prisma.user.upsert({
      where: { id: staffUserId },
      create: {
        id: staffUserId,
        email: "staff.upload@aldera.test",
        name: "Staff Uploader",
        password: "hashed_dummy_password",
        roles: ["ADMIN"],
      },
      update: {},
    });

    currentSession = {
      user: {
        id: staffUserId,
        role: "ADMIN",
        roles: ["ADMIN"],
        name: "Staff Uploader",
        email: "staff.upload@aldera.test",
      },
    };
  });

  describe("Authentication & Authorization Gates", () => {
    it("returns 401 when session is null", async () => {
      currentSession = null;
      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("returns 400 when client user attempts upload without projectId", async () => {
      currentSession = {
        user: {
          id: "client_user_no_proj",
          role: "CLIENT",
          roles: ["CLIENT"],
          name: "Client",
          email: "client@aldera.test",
        },
      };

      const formData = new FormData();
      formData.set("file", new File(["test content"], "doc.pdf", { type: "application/pdf" }));

      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain("ProjectId wajib disertakan");
    });

    it("returns 403 when client user tries to upload to a project they do not own", async () => {
      const stamp = Date.now();
      const otherUser = await prisma.user.create({
        data: {
          email: `owner_${stamp}@aldera.test`,
          name: "Project Owner",
          password: "hashed_dummy_password",
          roles: ["CLIENT"],
        },
      });

      const project = await prisma.project.create({
        data: {
          title: `Project ${stamp}`,
          description: "Test description",
          clientId: otherUser.id,
        },
      });

      currentSession = {
        user: {
          id: "attacker_client_id",
          role: "CLIENT",
          roles: ["CLIENT"],
          name: "Attacker",
          email: "attacker@aldera.test",
        },
      };

      const formData = new FormData();
      formData.set("file", new File(["file content"], "doc.pdf", { type: "application/pdf" }));
      formData.set("projectId", project.id);

      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.error).toBe("Forbidden");
    });
  });

  describe("File Limits, MIME Types & Path Traversal Sanitization", () => {
    it("returns 413 when file size exceeds 10MB limit", async () => {
      // 11MB file
      const largeBlob = new Blob([new Uint8Array(11 * 1024 * 1024)], { type: "application/pdf" });
      const largeFile = new File([largeBlob], "huge.pdf", { type: "application/pdf" });

      const formData = new FormData();
      formData.set("file", largeFile);

      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(413);
      const json = await res.json();
      expect(json.error).toContain("File too large");
    });

    it("returns 415 for unsupported MIME types (e.g. text/html, application/x-sh)", async () => {
      const formData = new FormData();
      formData.set("file", new File(["<script>alert(1)</script>"], "evil.html", { type: "text/html" }));

      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(415);
      const json = await res.json();
      expect(json.error).toContain("Unsupported mime type");
    });

    it("sanitizes path traversal attempts in filenames and saves file record", async () => {
      // Malicious filename with traversal attempt
      const traversalName = "../../../../../etc/passwd.png";
      const file = new File(["valid-png-data"], traversalName, { type: "image/png" });

      const formData = new FormData();
      formData.set("file", file);

      const req = new NextRequest("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.url).toMatch(/^\/uploads\/\d{4}\/\d{2}\//);
      expect(json.filename).not.toContain("../");

      // Verify sanitized filename stored in DB
      const dbFile = await prisma.file.findUnique({ where: { id: json.id } });
      expect(dbFile).not.toBeNull();
      expect(dbFile?.filename).not.toContain("../");
      expect(dbFile?.originalName).toBe(traversalName);
    });
  });
});
