import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Role } from "@prisma/client";
import { getTestPrisma } from "@/lib/test-prisma";

let session: { user: { id: string; role?: Role; roles?: Role[] } } | null;
mock.module("@/auth", () => ({
  auth: async () => session,
  handlers: {},
  signIn: mock(),
  signOut: mock(),
}));
mock.module("next/cache", () => ({ revalidatePath: mock() }));
const prisma = getTestPrisma();
mock.module("@/lib/prisma", () => ({ prisma, default: prisma }));
const actions = await import("./calculator");
const config = {
  featureDisclaimer: "fixture",
  revisionPolicy: "fixture",
  freeRevisions: 2,
  revisionPricePerItem: 500000,
  urgencyMultiplier: 1.2,
  urgencyThresholdDays: 14,
  dpPercentage: 50,
};

describe("Calculator mutation permission boundary", () => {
  beforeEach(() => {
    session = {
      user: {
        id: "fixture-developer",
        role: "DEVELOPER",
        roles: ["DEVELOPER"],
      },
    };
  });
  it("rejects developer writes for every pricing mutation", async () => {
    const mutations = [
      () => actions.updateCalculatorConfig(config),
      () =>
        actions.upsertProjectType(null, {
          name: "fixture",
          slug: "fixture",
          basePrice: 1,
          icon: "code",
          dependentFields: [],
          order: 0,
          active: true,
        }),
      () => actions.deleteProjectType("fixture"),
      () =>
        actions.upsertFeatureOption(null, {
          name: "fixture",
          price: 1,
          isMajor: false,
          projectTypeId: "fixture",
          order: 0,
          active: true,
        }),
      () => actions.deleteFeatureOption("fixture"),
      () =>
        actions.upsertAddOnOption(null, {
          name: "fixture",
          pricePerMonth: 1,
          minMonths: 1,
          maxMonths: 12,
          order: 0,
          active: true,
        }),
      () => actions.deleteAddOnOption("fixture"),
    ];
    for (const mutate of mutations)
      await expect(mutate()).rejects.toThrow("Forbidden");
  });
  it("does not let a legacy role override the actual role list", async () => {
    session = { user: { id: "fixture", role: "ADMIN", roles: ["DEVELOPER"] } };
    await expect(actions.updateCalculatorConfig(config)).rejects.toThrow(
      "Forbidden"
    );
    session = null;
    await expect(actions.updateCalculatorConfig(config)).rejects.toThrow(
      "Forbidden"
    );
  });
  it("allows an admin to create and remove a project type", async () => {
    session = { user: { id: "fixture-admin", roles: ["ADMIN"] } };
    const slug = `permission-fixture-${crypto.randomUUID()}`;
    await actions.upsertProjectType(null, {
      name: "Permission Fixture",
      slug,
      basePrice: 100000,
      icon: "code",
      dependentFields: [],
      order: 0,
      active: false,
    });
    const row = await prisma.projectType.findUniqueOrThrow({ where: { slug } });
    expect(Number(row.basePrice)).toBe(100000);
    await actions.deleteProjectType(row.id);
    expect(
      await prisma.projectType.findUnique({ where: { id: row.id } })
    ).toBeNull();
  });
});
