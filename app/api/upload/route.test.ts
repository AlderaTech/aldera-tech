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
const mockUnlink = mock(async () => {});

mock.module("node:fs/promises", () => ({
  writeFile: mockWriteFile,
  mkdir: mockMkdir,
  unlink: mockUnlink,
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
    mockUnlink.mockClear();

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
      formData.set(
        "file",
        new File(["test content"], "doc.pdf", { type: "application/pdf" })
      );

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
      formData.set(
        "file",
        new File(["file content"], "doc.pdf", { type: "application/pdf" })
      );
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
      const largeBlob = new Blob([new Uint8Array(11 * 1024 * 1024)], {
        type: "application/pdf",
      });
      const largeFile = new File([largeBlob], "huge.pdf", {
        type: "application/pdf",
      });

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
      formData.set(
        "file",
        new File(["<script>alert(1)</script>"], "evil.html", {
          type: "text/html",
        })
      );

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
      const file = new File(
        [
          await (
            await import("sharp")
          )
            .default({
              create: { width: 1, height: 1, channels: 4, background: "white" },
            })
            .png()
            .toBuffer(),
        ],
        traversalName,
        {
          type: "image/png",
        }
      );

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
  describe("Upload persistence regression", () => {
    it("returns 500 and removes the written file if metadata cannot be saved", async () => {
      currentSession = {
        user: {
          id: "nonexistent-metadata-uploader",
          role: "ADMIN",
          roles: ["ADMIN"],
        },
      };
      const formData = new FormData();
      formData.set(
        "file",
        new File(["%PDF-1.7\nfixture"], "proof.pdf", {
          type: "application/pdf",
        })
      );
      const res = await POST(
        new NextRequest("http://localhost:3000/api/upload", {
          method: "POST",
          body: formData,
        })
      );
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.url).toBeUndefined();
      expect(mockWriteFile).toHaveBeenCalledTimes(1);
      expect(mockUnlink).toHaveBeenCalledTimes(1);
    });
    it("accepts an owned invoice without requiring an unrelated project", async () => {
      const user = await prisma.user.create({
        data: {
          email: crypto.randomUUID() + "@example.invalid",
          name: "Upload Fixture",
          password: "fixture",
          roles: ["CLIENT"],
        },
      });
      const invoice = await prisma.invoice.create({
        data: {
          number: "UPLOAD-" + crypto.randomUUID(),
          clientId: user.id,
          issueDate: new Date(),
          dueDate: new Date(),
          subtotal: 100000,
          total: 100000,
          status: "SENT",
        },
      });
      currentSession = {
        user: { id: user.id, role: "CLIENT", roles: ["CLIENT"] },
      };
      const makeRequest = () => {
        const data = new FormData();
        data.set(
          "file",
          new File(["%PDF-1.7\nfixture"], "proof.pdf", {
            type: "application/pdf",
          })
        );
        data.set("invoiceId", invoice.id);
        return new NextRequest("http://localhost:3000/api/upload", {
          method: "POST",
          body: data,
        });
      };
      const res = await POST(makeRequest());
      expect(res.status).toBe(200);
      const uploaded = await res.json();
      expect(uploaded.id).toBeTruthy();
      expect(uploaded.url).toMatch(/^\/api\/files\/[^?]+\?filename=.*\.pdf$/);
      currentSession = {
        user: { id: "foreign-client", role: "CLIENT", roles: ["CLIENT"] },
      };
      expect((await POST(makeRequest())).status).toBe(403);
      currentSession = {
        user: { id: staffUserId, role: "DEVELOPER", roles: ["DEVELOPER"] },
      };
      expect((await POST(makeRequest())).status).toBe(403);
      currentSession = {
        user: { id: user.id, role: "CLIENT", roles: ["CLIENT"] },
      };
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAID" },
      });
      expect((await POST(makeRequest())).status).toBe(400);
    });
  });
});
