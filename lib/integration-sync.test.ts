import { describe, it, expect, mock, spyOn } from "bun:test";
import { getTestPrisma } from "./test-prisma";
import { getRouterPool, queryRouter } from "./router-db";
const prisma = getTestPrisma();
mock.module("@/lib/prisma", () => ({ prisma, default: prisma }));
const { queueIntegrationSync, syncIntegrationSettings } =
  await import("./integration-sync");
describe("Recoverable settings synchronization", () => {
  it("keeps failed router writes pending, retries the committed source, and preserves unrelated router settings", async () => {
    const id = crypto.randomUUID(),
      unrelated = crypto.randomUUID();
    await queryRouter(
      "INSERT INTO payment_method_settings (id,type,name,account_number,account_name,is_active,display_order) VALUES ($1,'BANK_TRANSFER','Bot only','123','Fixture',true,0)",
      [unrelated]
    );
    await prisma.$transaction(async (tx) => {
      await tx.paymentMethodSetting.create({
        data: {
          id,
          type: "BANK_TRANSFER",
          name: "Primary source",
          accountNumber: "456",
          accountName: "Fixture",
        },
      });
      await queueIntegrationSync(tx, `payment-method:${id}`);
    });
    const failure = spyOn(getRouterPool(), "connect").mockRejectedValueOnce(
      new Error("router unavailable")
    );
    try {
      await expect(
        syncIntegrationSettings(`payment-method:${id}`)
      ).rejects.toThrow("sinkronisasi bot tertunda");
    } finally {
      failure.mockRestore();
    }
    let state = await prisma.integrationSyncState.findUniqueOrThrow({
      where: { id: `payment-method:${id}` },
    });
    expect(state.appliedRevision).toBe(0);
    expect(state.lastError).not.toBeNull();
    await syncIntegrationSettings(`payment-method:${id}`);
    state = await prisma.integrationSyncState.findUniqueOrThrow({
      where: { id: `payment-method:${id}` },
    });
    expect(state.appliedRevision).toBe(state.revision);
    expect(state.lastError).toBeNull();
    expect(
      (
        await queryRouter(
          "SELECT id FROM payment_method_settings WHERE id=$1",
          [unrelated]
        )
      ).rows
    ).toHaveLength(1);
    await prisma.$transaction(async (tx) => {
      await tx.paymentMethodSetting.delete({ where: { id } });
      await queueIntegrationSync(tx, `payment-method:${id}`);
    });
    await syncIntegrationSettings(`payment-method:${id}`);
    expect(
      (
        await queryRouter(
          "SELECT id FROM payment_method_settings WHERE id=$1",
          [id]
        )
      ).rows
    ).toHaveLength(0);
    expect(
      (
        await queryRouter(
          "SELECT id FROM payment_method_settings WHERE id=$1",
          [unrelated]
        )
      ).rows
    ).toHaveLength(1);
  });
});
