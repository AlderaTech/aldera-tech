import { beforeEach, describe, expect, it, mock } from "bun:test";

const getUser = mock(
  async (): Promise<{
    avatar: string | null;
    phone: string | null;
  } | null> => ({ avatar: null, phone: null })
);
const countProjects = mock(async () => 0);
const countMessages = mock(async () => 0);
const countInvoices = mock(async () => 0);
const auth = mock(async (): Promise<{ user: { id: string } } | null> => ({
  user: { id: "onboarding-test" },
}));
mock.module("@/auth", () => ({ auth }));
mock.module("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: getUser },
    project: { count: countProjects },
    projectMessage: { count: countMessages },
    invoice: { count: countInvoices },
  },
}));
const { OnboardingChecklist } = await import("./onboarding-checklist");

describe("Progres onboarding asli", () => {
  beforeEach(() => {
    auth.mockReset();
    auth.mockResolvedValue({ user: { id: "onboarding-test" } });
    getUser.mockReset();
    getUser.mockResolvedValue({ avatar: null, phone: null });
    for (const query of [countProjects, countMessages, countInvoices]) {
      query.mockReset();
      query.mockResolvedValue(0);
    }
  });
  it("mempertahankan keempat query dan seluruh langkah pada 0%", async () => {
    const node = await OnboardingChecklist();
    expect(getUser).toHaveBeenCalledWith({
      where: { id: "onboarding-test" },
      select: { avatar: true, phone: true },
    });
    expect(countProjects).toHaveBeenCalledWith({
      where: { clientId: "onboarding-test" },
    });
    expect(countMessages).toHaveBeenCalledWith({
      where: {
        project: { clientId: "onboarding-test" },
        authorId: "onboarding-test",
      },
    });
    expect(countInvoices).toHaveBeenCalledWith({
      where: { clientId: "onboarding-test", status: "PAID" },
    });
    expect(node?.props.steps).toHaveLength(4);
    expect(node?.props.percent).toBe(0);
  });
  it("tetap memakai telepon sebagai syarat profil selesai dan pembulatan progres yang sama", async () => {
    getUser.mockResolvedValueOnce({ avatar: null, phone: "+6281230000000" });
    const node = await OnboardingChecklist();
    expect(node?.props.percent).toBe(25);
    expect(node?.props.completed).toBe(1);
    expect(node?.props.steps.map((step) => step.done)).toEqual([
      true,
      false,
      false,
      false,
    ]);
    getUser.mockResolvedValueOnce({ avatar: "/fixture.webp", phone: null });
    expect((await OnboardingChecklist())?.props.percent).toBe(0);
  });
  it("menyembunyikan panel hanya ketika semua langkah selesai atau sesi tidak tersedia", async () => {
    getUser.mockResolvedValueOnce({ avatar: null, phone: "+6281230000000" });
    for (const query of [countProjects, countMessages, countInvoices])
      query.mockResolvedValueOnce(1);
    expect(await OnboardingChecklist()).toBeNull();
    auth.mockResolvedValueOnce(null);
    expect(await OnboardingChecklist()).toBeNull();
  });
});
