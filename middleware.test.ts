import { describe, it, expect } from "bun:test";
import { middlewareHandler } from "./middleware";

describe("middleware.ts route security & guard unit test suite", () => {
  const baseUrl = "http://localhost:3000";

  describe("1. URL Path Normalization & Double Slash Bypass Prevention", () => {
    it("collapses multi-slash path and evaluates normalized route guard", () => {
      const req = {
        nextUrl: new URL(`${baseUrl}//admin//ai-relay`),
        auth: null,
      };
      const res = middlewareHandler(req);
      // Unauthenticated to /admin/ai-relay should redirect to /login with normalized callbackUrl
      expect(res.status).toBe(307);
      const location = res.headers.get("location");
      expect(location).toContain("/login");
      expect(location).toContain("callbackUrl=%2Fadmin%2Fai-relay");
    });
  });

  describe("2. Protected Admin API Routes (/api/admin/*)", () => {
    it("rejects unauthenticated requests to /api/admin/ai-relay with 401", async () => {
      const req = {
        nextUrl: new URL(`${baseUrl}/api/admin/ai-relay/models`),
        auth: null,
      };
      const res = middlewareHandler(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json).toEqual({ error: "Unauthorized" });
    });

    it("rejects non-admin roles (DEVELOPER, CLIENT) to /api/admin/ai-relay with 403", async () => {
      const devReq = {
        nextUrl: new URL(`${baseUrl}/api/admin/ai-relay/sync`),
        auth: { user: { role: "DEVELOPER", roles: ["DEVELOPER"] } },
      };
      const devRes = middlewareHandler(devReq);
      expect(devRes.status).toBe(403);

      const clientReq = {
        nextUrl: new URL(`${baseUrl}/api/admin/ai-relay/sync`),
        auth: { user: { role: "CLIENT", roles: ["CLIENT"] } },
      };
      const clientRes = middlewareHandler(clientReq);
      expect(clientRes.status).toBe(403);
    });

    it("allows ADMIN access to /api/admin/ai-relay", () => {
      const req = {
        nextUrl: new URL(`${baseUrl}/api/admin/ai-relay/sync`),
        auth: { user: { role: "ADMIN", roles: ["ADMIN"] } },
      };
      const res = middlewareHandler(req);
      expect(res.status).toBe(200);
    });

    it("guards granular export route /api/admin/export/analytics", async () => {
      const unauthReq = {
        nextUrl: new URL(`${baseUrl}/api/admin/export/analytics`),
        auth: null,
      };
      expect(middlewareHandler(unauthReq).status).toBe(401);

      const clientReq = {
        nextUrl: new URL(`${baseUrl}/api/admin/export/analytics`),
        auth: { user: { role: "CLIENT", roles: ["CLIENT"] } },
      };
      expect(middlewareHandler(clientReq).status).toBe(403);

      const adminReq = {
        nextUrl: new URL(`${baseUrl}/api/admin/export/analytics`),
        auth: { user: { role: "ADMIN", roles: ["ADMIN"] } },
      };
      expect(middlewareHandler(adminReq).status).toBe(200);
    });
  });

  describe("3. Admin UI Route Guards (/admin/*)", () => {
    it("redirects unauthenticated guest trying to visit /admin to /login with callbackUrl", () => {
      const req = {
        nextUrl: new URL(`${baseUrl}/admin/projects`),
        auth: null,
      };
      const res = middlewareHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain(
        "/login?callbackUrl=%2Fadmin%2Fprojects"
      );
    });

    it("strictly prohibits CLIENT from visiting /admin, redirecting to /dashboard", () => {
      const req = {
        nextUrl: new URL(`${baseUrl}/admin/projects`),
        auth: { user: { role: "CLIENT", roles: ["CLIENT"] } },
      };
      const res = middlewareHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe(`${baseUrl}/dashboard`);
    });

    it("allows STAFF (DEVELOPER, ADMIN) to visit /admin", () => {
      const devReq = {
        nextUrl: new URL(`${baseUrl}/admin/projects`),
        auth: { user: { role: "DEVELOPER", roles: ["DEVELOPER"] } },
      };
      expect(middlewareHandler(devReq).status).toBe(200);

      const adminReq = {
        nextUrl: new URL(`${baseUrl}/admin/projects`),
        auth: { user: { role: "ADMIN", roles: ["ADMIN"] } },
      };
      expect(middlewareHandler(adminReq).status).toBe(200);
    });

    it("guards /admin/ai-relay page strictly for ADMIN role", () => {
      const devReq = {
        nextUrl: new URL(`${baseUrl}/admin/ai-relay`),
        auth: { user: { role: "DEVELOPER", roles: ["DEVELOPER"] } },
      };
      const devRes = middlewareHandler(devReq);
      expect(devRes.status).toBe(307);
      // DEVELOPER falls back to /admin
      expect(devRes.headers.get("location")).toBe(`${baseUrl}/admin`);

      const adminReq = {
        nextUrl: new URL(`${baseUrl}/admin/ai-relay`),
        auth: { user: { role: "ADMIN", roles: ["ADMIN"] } },
      };
      expect(middlewareHandler(adminReq).status).toBe(200);
    });
  });

  describe("4. Client Dashboard Route Guards (/dashboard/*)", () => {
    it("redirects unauthenticated guest to /login with callbackUrl", () => {
      const req = {
        nextUrl: new URL(`${baseUrl}/dashboard/invoices`),
        auth: null,
      };
      const res = middlewareHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain(
        "/login?callbackUrl=%2Fdashboard%2Finvoices"
      );
    });

    it("allows authenticated client user to access /dashboard", () => {
      const req = {
        nextUrl: new URL(`${baseUrl}/dashboard/invoices`),
        auth: { user: { role: "CLIENT", roles: ["CLIENT"] } },
      };
      expect(middlewareHandler(req).status).toBe(200);
    });
  });

  describe("5. Authentication Pages Redirect for Logged-In Users", () => {
    it("redirects logged-in staff visiting /login to /admin", () => {
      const req = {
        nextUrl: new URL(`${baseUrl}/login`),
        auth: { user: { role: "ADMIN", roles: ["ADMIN"] } },
      };
      const res = middlewareHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe(`${baseUrl}/admin`);
    });

    it("redirects logged-in client visiting /register to /dashboard", () => {
      const req = {
        nextUrl: new URL(`${baseUrl}/register`),
        auth: { user: { role: "CLIENT", roles: ["CLIENT"] } },
      };
      const res = middlewareHandler(req);
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe(`${baseUrl}/dashboard`);
    });

    it("allows unauthenticated guests to visit /login and /register", () => {
      const loginReq = {
        nextUrl: new URL(`${baseUrl}/login`),
        auth: null,
      };
      expect(middlewareHandler(loginReq).status).toBe(200);

      const registerReq = {
        nextUrl: new URL(`${baseUrl}/register`),
        auth: null,
      };
      expect(middlewareHandler(registerReq).status).toBe(200);
    });
  });
});
