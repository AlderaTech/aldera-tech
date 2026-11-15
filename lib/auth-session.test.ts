import { describe, expect, it, mock } from "bun:test";
import type { Role } from "@prisma/client";
import { canSignInAccount, refreshSessionToken } from "./auth-session";

describe("Account authorization refresh", () => {
  it("rejects a session issued before a password reset or account security change", async () => {
    expect(
      await refreshSessionToken(
        { id: "fixture", securityVersion: 0 },
        async () => ({ isActive: true, roles: ["CLIENT"], securityVersion: 1 })
      )
    ).toBeNull();
  });
  it("refreshes revoked roles instead of trusting an old ADMIN token", async () => {
    const token = await refreshSessionToken(
      { id: "fixture", role: "ADMIN", roles: ["ADMIN"] },
      async () => ({ securityVersion: 0, isActive: true, roles: ["CLIENT"] })
    );
    expect(token?.roles).toEqual(["CLIENT"]);
    expect(token?.role).toBe("CLIENT");
  });
  it("rejects disabled, deleted, or roleless accounts", async () => {
    for (const account of [
      null,
      { securityVersion: 0, isActive: false, roles: ["ADMIN"] as Role[] },
      { securityVersion: 0, isActive: true, roles: [] as Role[] },
    ]) {
      expect(
        await refreshSessionToken({ id: "fixture" }, async () => account)
      ).toBeNull();
    }
  });
  it("denies access on database failure and rejects a token without identity", async () => {
    expect(
      await refreshSessionToken({ sub: "fixture" }, async () => {
        throw new Error("fixture DB failure");
      })
    ).toBeNull();
    const lookup = mock(async () => ({
      securityVersion: 0,
      isActive: true,
      roles: ["CLIENT"] as Role[],
    }));
    expect(await refreshSessionToken({}, lookup)).toBeNull();
    expect(lookup).not.toHaveBeenCalled();
  });
  it("permits an admin-invited account without falsely verifying its phone", () => {
    const account = {
      email: "invite@example.invalid",
      roles: ["CLIENT"] as Role[],
      securityVersion: 0,
      isActive: true,
      invitedAt: new Date(),
      phoneVerified: null,
    };
    expect(canSignInAccount(account)).toBe(true);
    expect(canSignInAccount({ ...account, isActive: false })).toBe(false);
    expect(canSignInAccount({ ...account, invitedAt: null })).toBe(false);
    expect(
      canSignInAccount({
        ...account,
        invitedAt: null,
        phoneVerified: new Date(),
      })
    ).toBe(true);
  });
});
