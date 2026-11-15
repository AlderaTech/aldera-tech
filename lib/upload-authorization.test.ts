import { describe, expect, it, mock } from "bun:test";
import { getTestPrisma } from "@/lib/test-prisma";
import { queryRouter } from "@/lib/router-db";
const prisma = getTestPrisma();
mock.module("@/lib/prisma", () => ({ prisma, default: prisma }));
const { authorizeUpload } = await import("./upload-authorization");

describe("Proof upload ownership", () => {
  it("accepts only a pending top-up belonging to the authenticated web account", async () => {
    const webId = `upload-${crypto.randomUUID()}`;
    const owner = await queryRouter<{ id: number }>(
      "INSERT INTO users (web_user_id, full_name, username, balance, is_active) VALUES ($1, 'Upload Fixture', $1, 0, true) RETURNING id",
      [webId]
    );
    const ticket = await queryRouter<{ id: number }>(
      "INSERT INTO topup_requests (user_id, amount, unique_code, total_transfer, status) VALUES ($1, 100000, 123, 100123, 'pending') RETURNING id",
      [owner.rows[0].id]
    );
    const data = new FormData();
    data.set("topupId", String(ticket.rows[0].id));
    const user = { id: webId, roles: ["CLIENT"] as const };
    expect(await authorizeUpload(data, { ...user, roles: ["CLIENT"] })).toEqual(
      { ok: true, projectId: null, proof: true }
    );
    expect(
      (
        await authorizeUpload(data, {
          id: "another-account",
          roles: ["CLIENT"],
        })
      ).ok
    ).toBe(false);
    await queryRouter(
      "UPDATE topup_requests SET status = 'rejected' WHERE id = $1",
      [ticket.rows[0].id]
    );
    expect(
      (await authorizeUpload(data, { ...user, roles: ["CLIENT"] })).ok
    ).toBe(false);
  });
  it("rejects ambiguous, negative, and malformed upload contexts before database access", async () => {
    for (const fields of [
      { topupId: "-1" },
      { topupId: "not-a-number" },
      { topupId: "1", invoiceId: "fixture" },
      { projectId: "fixture", invoiceId: "fixture" },
    ]) {
      const data = new FormData();
      Object.entries(fields).forEach(([key, value]) => data.set(key, value));
      const result = await authorizeUpload(data, {
        id: "fixture",
        roles: ["ADMIN"],
      });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.status).toBe(400);
    }
  });
});
