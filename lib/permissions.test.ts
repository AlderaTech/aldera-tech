import { describe, it, expect } from "bun:test";
import {
  isStaff,
  isAdmin,
  isDeveloper,
  isClient,
  getPrimaryRole,
  hasPermission,
  hasAnyPermission,
  getEffectivePermissions,
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
  });
});
