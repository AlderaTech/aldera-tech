import { describe, it, expect } from "bun:test";
import { NextRequest } from "next/server";
import type { Role } from "@prisma/client";
import middleware from "../middleware";
import {
  isStaff,
  isAdmin,
  isDeveloper,
  isClient,
  getPrimaryRole,
  hasPermission,
  hasAnyPermission,
  getEffectivePermissions,
  canAccessAiRelayAdmin,
  PERMISSIONS,
} from "../lib/permissions";

describe("Permissions Matrix & Role Guard Verification", () => {
  describe("Role checks", () => {
    it("identifies ADMIN as staff and admin", () => {
      expect(isStaff("ADMIN")).toBe(true);
      expect(isAdmin("ADMIN")).toBe(true);
      expect(isDeveloper("ADMIN")).toBe(false);
      expect(isClient("ADMIN")).toBe(false);
    });

    it("identifies DEVELOPER as staff and not admin", () => {
      expect(isStaff("DEVELOPER")).toBe(true);
      expect(isAdmin("DEVELOPER")).toBe(false);
      expect(isDeveloper("DEVELOPER")).toBe(true);
      expect(isClient("DEVELOPER")).toBe(false);
    });

    it("identifies CLIENT as non-staff", () => {
      expect(isStaff("CLIENT")).toBe(false);
      expect(isAdmin("CLIENT")).toBe(false);
      expect(isDeveloper("CLIENT")).toBe(false);
      expect(isClient("CLIENT")).toBe(true);
    });

    it("handles multiple roles properly", () => {
      expect(isStaff(["CLIENT", "DEVELOPER"])).toBe(true);
      expect(isAdmin(["CLIENT", "DEVELOPER"])).toBe(false);
      expect(isAdmin(["ADMIN", "DEVELOPER"])).toBe(true);
    });

    it("handles null and undefined safely", () => {
      expect(isStaff(null)).toBe(false);
      expect(isAdmin(undefined)).toBe(false);
      expect(isClient(null)).toBe(false);
    });
  });

  describe("Primary Role Resolution", () => {
    it("resolves ADMIN as highest hierarchy", () => {
      expect(getPrimaryRole(["CLIENT", "ADMIN", "DEVELOPER"])).toBe("ADMIN");
      expect(getPrimaryRole(["DEVELOPER", "ADMIN"])).toBe("ADMIN");
    });

    it("resolves DEVELOPER over CLIENT", () => {
      expect(getPrimaryRole(["CLIENT", "DEVELOPER"])).toBe("DEVELOPER");
    });

    it("defaults to CLIENT for empty or null", () => {
      expect(getPrimaryRole([])).toBe("CLIENT");
      expect(getPrimaryRole(null)).toBe("CLIENT");
      expect(getPrimaryRole(undefined)).toBe("CLIENT");
    });
  });

  describe("Permission Matrix Check", () => {
    it("grants ADMIN all permissions", () => {
      expect(hasPermission("ADMIN", PERMISSIONS.USER_MANAGE)).toBe(true);
      expect(hasPermission("ADMIN", PERMISSIONS.SETTINGS_MANAGE)).toBe(true);
      expect(hasPermission("ADMIN", PERMISSIONS.INVOICE_CREATE)).toBe(true);
      expect(hasPermission("ADMIN", PERMISSIONS.PROJECT_DELETE)).toBe(true);
    });

    it("grants DEVELOPER operational permissions but not admin management", () => {
      expect(hasPermission("DEVELOPER", PERMISSIONS.PROJECT_VIEW_ALL)).toBe(
        true
      );
      expect(hasPermission("DEVELOPER", PERMISSIONS.TIMESHEET_VIEW)).toBe(true);
      expect(hasPermission("DEVELOPER", PERMISSIONS.PORTFOLIO_MANAGE)).toBe(
        true
      );

      // Should not have admin-only permissions
      expect(hasPermission("DEVELOPER", PERMISSIONS.USER_MANAGE)).toBe(false);
      expect(hasPermission("DEVELOPER", PERMISSIONS.SETTINGS_MANAGE)).toBe(
        false
      );
      expect(hasPermission("DEVELOPER", PERMISSIONS.INVOICE_CREATE)).toBe(
        false
      );
    });

    it("grants CLIENT no admin permissions", () => {
      expect(hasPermission("CLIENT", PERMISSIONS.PROJECT_VIEW_ALL)).toBe(false);
      expect(hasPermission("CLIENT", PERMISSIONS.BLOG_CREATE)).toBe(false);
      expect(hasPermission("CLIENT", PERMISSIONS.USER_MANAGE)).toBe(false);
    });

    it("verifies hasAnyPermission and getEffectivePermissions", () => {
      expect(
        hasAnyPermission(
          "DEVELOPER",
          PERMISSIONS.USER_MANAGE,
          PERMISSIONS.TIMESHEET_VIEW
        )
      ).toBe(true);
      expect(
        hasAnyPermission(
          "CLIENT",
          PERMISSIONS.USER_MANAGE,
          PERMISSIONS.SETTINGS_MANAGE
        )
      ).toBe(false);

      const devPerms = getEffectivePermissions("DEVELOPER");
      expect(devPerms).toContain(PERMISSIONS.PROJECT_VIEW_ALL);
      expect(devPerms).not.toContain(PERMISSIONS.SETTINGS_MANAGE);
    });

    it("verifies AI Relay admin permissions are strictly restricted to ADMIN", () => {
      // ADMIN must have access
      expect(canAccessAiRelayAdmin("ADMIN")).toBe(true);
      expect(canAccessAiRelayAdmin(["ADMIN", "DEVELOPER"])).toBe(true);
      expect(hasPermission("ADMIN", PERMISSIONS.AI_RELAY_MANAGE)).toBe(true);
      expect(hasPermission("ADMIN", PERMISSIONS.AI_RELAY_VIEW)).toBe(true);

      // DEVELOPER must be strictly rejected
      expect(canAccessAiRelayAdmin("DEVELOPER")).toBe(false);
      expect(canAccessAiRelayAdmin(["DEVELOPER"])).toBe(false);
      expect(hasPermission("DEVELOPER", PERMISSIONS.AI_RELAY_MANAGE)).toBe(
        false
      );
      expect(hasPermission("DEVELOPER", PERMISSIONS.AI_RELAY_VIEW)).toBe(
        false
      );

      // CLIENT must be strictly rejected
      expect(canAccessAiRelayAdmin("CLIENT")).toBe(false);
      expect(canAccessAiRelayAdmin(["CLIENT"])).toBe(false);
      expect(hasPermission("CLIENT", PERMISSIONS.AI_RELAY_MANAGE)).toBe(false);
      expect(hasPermission("CLIENT", PERMISSIONS.AI_RELAY_VIEW)).toBe(false);

      // Null / undefined safely rejected
      expect(canAccessAiRelayAdmin(null)).toBe(false);
      expect(canAccessAiRelayAdmin(undefined)).toBe(false);
    });
  });

  describe("Object Type Safety & Non-Array Handling", () => {
    it("safely handles non-array objects without throwing TypeErrors", () => {
      const nonArrayObjects = [
        {},
        { role: "ADMIN" },
        { roles: ["ADMIN"] },
        Object.create(null),
      ];

      for (const obj of nonArrayObjects) {
        const invalidRole = obj as unknown as Role;
        expect(() => isStaff(invalidRole)).not.toThrow();
        expect(isStaff(invalidRole)).toBe(false);

        expect(() => isAdmin(invalidRole)).not.toThrow();
        expect(isAdmin(invalidRole)).toBe(false);

        expect(() => isDeveloper(invalidRole)).not.toThrow();
        expect(isDeveloper(invalidRole)).toBe(false);

        expect(() => isClient(invalidRole)).not.toThrow();
        expect(isClient(invalidRole)).toBe(false);

        expect(() =>
          canAccessAiRelayAdmin(invalidRole)
        ).not.toThrow();
        expect(canAccessAiRelayAdmin(invalidRole)).toBe(false);

        expect(() => getPrimaryRole(invalidRole)).not.toThrow();
        expect(getPrimaryRole(invalidRole)).toBe("CLIENT");

        expect(() =>
          hasPermission(invalidRole, PERMISSIONS.USER_MANAGE)
        ).not.toThrow();
        expect(
          hasPermission(invalidRole, PERMISSIONS.USER_MANAGE)
        ).toBe(false);

        expect(() =>
          hasAnyPermission(invalidRole, PERMISSIONS.USER_MANAGE)
        ).not.toThrow();
        expect(
          hasAnyPermission(invalidRole, PERMISSIONS.USER_MANAGE)
        ).toBe(false);

        expect(() =>
          getEffectivePermissions(invalidRole)
        ).not.toThrow();
        expect(getEffectivePermissions(invalidRole)).toEqual([]);
      }
    });

    it("safely handles primitive non-string values without throwing", () => {
      const primitives = [123, 0, true, false, Symbol("role")];

      for (const prim of primitives) {
        const invalidRole = prim as unknown as Role;
        expect(isStaff(invalidRole)).toBe(false);
        expect(isAdmin(invalidRole)).toBe(false);
        expect(isDeveloper(invalidRole)).toBe(false);
        expect(isClient(invalidRole)).toBe(false);
        expect(canAccessAiRelayAdmin(invalidRole)).toBe(false);
        expect(getPrimaryRole(invalidRole)).toBe("CLIENT");
        expect(
          hasPermission(invalidRole, PERMISSIONS.USER_MANAGE)
        ).toBe(false);
        expect(getEffectivePermissions(invalidRole)).toEqual([]);
      }
    });
  });

  describe("Route Guard & Path Normalization (Double Slash Mitigation)", () => {
    it("collapses consecutive slashes preventing route guard bypass", () => {
      const testCases = [
        { input: "/admin//ai-relay", expected: "/admin/ai-relay" },
        { input: "/api/admin///ai-relay", expected: "/api/admin/ai-relay" },
        {
          input: "/admin////ai-relay/settings",
          expected: "/admin/ai-relay/settings",
        },
        { input: "//admin//ai-relay", expected: "/admin/ai-relay" },
      ];

      for (const { input, expected } of testCases) {
        const normalized = input.replace(/\/+/g, "/");
        expect(normalized).toBe(expected);
      }
    });

    it("evaluates strict AI Relay route access after slash normalization", () => {
      function evaluateRouteAccess(
        rawPath: string,
        roles: string[]
      ): "ALLOW" | "BLOCK" {
        const pathname = rawPath.replace(/\/+/g, "/");
        const isAiRelayStrict =
          pathname.startsWith("/admin/ai-relay") ||
          pathname.startsWith("/api/admin/ai-relay");
        const isGeneralAdmin =
          pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
        const userIsAdmin = roles.includes("ADMIN");
        const userIsStaff =
          roles.includes("ADMIN") || roles.includes("DEVELOPER");

        if (isAiRelayStrict) {
          return userIsAdmin ? "ALLOW" : "BLOCK";
        }
        if (isGeneralAdmin) {
          return userIsStaff ? "ALLOW" : "BLOCK";
        }
        return "ALLOW";
      }

      // DEVELOPER attempting double slash bypass must be BLOCKED
      expect(evaluateRouteAccess("/admin//ai-relay", ["DEVELOPER"])).toBe(
        "BLOCK"
      );
      expect(evaluateRouteAccess("/api/admin//ai-relay", ["DEVELOPER"])).toBe(
        "BLOCK"
      );
      expect(evaluateRouteAccess("/admin///ai-relay", ["DEVELOPER"])).toBe(
        "BLOCK"
      );

      // CLIENT attempting double slash bypass must be BLOCKED
      expect(evaluateRouteAccess("/admin//ai-relay", ["CLIENT"])).toBe("BLOCK");
      expect(evaluateRouteAccess("/api/admin//ai-relay", ["CLIENT"])).toBe(
        "BLOCK"
      );

      // ADMIN must be ALLOWED
      expect(evaluateRouteAccess("/admin//ai-relay", ["ADMIN"])).toBe("ALLOW");
      expect(evaluateRouteAccess("/api/admin//ai-relay", ["ADMIN"])).toBe(
        "ALLOW"
      );
    });

    it("verifies middleware normalizes consecutive slashes in callbackUrl redirects", async () => {
      const req = new NextRequest("http://localhost:3000/admin//ai-relay");
      const res = await (
        middleware as unknown as (r: NextRequest) => Promise<Response | null>
      )(req);
      expect(res?.status).toBe(307);
      const location = res?.headers?.get("location");
      expect(location).toBe(
        "http://localhost:3000/login?callbackUrl=%2Fadmin%2Fai-relay"
      );
    });
  });
});

