import { beforeEach, describe, expect, it, mock } from "bun:test";
import { projects, recent, user } from "./_components/_fixtures/overview";
import { renderToStaticMarkup } from "react-dom/server";

const projectCount = mock(async () => 3);
const invoiceCount = mock(async () => 2);
const aggregate = mock(async () => ({ _sum: { total: 1234567.89 } }));
const findProjects = mock(async () => projects);
const findActivity = mock(async () => recent);
mock.module("@/auth", () => ({ auth: async () => ({ user }) }));
mock.module("@/lib/prisma", () => ({
  prisma: {
    project: { count: projectCount, findMany: findProjects },
    invoice: { count: invoiceCount, aggregate },
    activityLog: { findMany: findActivity },
  },
}));
const { default: Page, metadata } = await import("./page");
const { default: Loading } = await import("./loading");

describe("Data dan susunan halaman Ringkasan", () => {
  beforeEach(() => {
    projectCount.mockReset();
    projectCount.mockResolvedValue(3);
    invoiceCount.mockReset();
    invoiceCount.mockResolvedValue(2);
    aggregate.mockReset();
    aggregate.mockResolvedValue({ _sum: { total: 1234567.89 } });
    findProjects.mockReset();
    findProjects.mockResolvedValue(projects);
    findActivity.mockReset();
    findActivity.mockResolvedValue(recent);
  });
  it("mempertahankan query, cakupan akun, urutan, dan batas 3 proyek / 6 aktivitas", async () => {
    const page = await Page();
    expect(projectCount).toHaveBeenCalledWith({
      where: { clientId: user.id, status: { in: ["IN_PROGRESS", "REVIEW"] } },
    });
    expect(invoiceCount).toHaveBeenCalledWith({
      where: { clientId: user.id, status: { in: ["SENT", "OVERDUE"] } },
    });
    expect(aggregate).toHaveBeenCalledWith({
      _sum: { total: true },
      where: { clientId: user.id, status: "PAID" },
    });
    expect(findProjects).toHaveBeenCalledWith({
      where: { clientId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 3,
      include: {
        milestones: {
          where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
          orderBy: { dueDate: "asc" },
          take: 1,
        },
      },
    });
    expect(findActivity).toHaveBeenCalledWith({
      where: { project: { clientId: user.id } },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { project: { select: { title: true, id: true } } },
    });
    expect(page.props.stats.props).toEqual({
      active: 3,
      pending: 2,
      spent: 1234567.89,
    });
    expect(page.props.projects.props.projects).toEqual(projects);
    expect(page.props.activity.props.recent).toEqual(recent);
    expect(page.props.empty).toBe(false);
  });
  it("memilih susunan sederhana hanya ketika kedua daftar kosong", async () => {
    findProjects.mockResolvedValueOnce([]);
    findActivity.mockResolvedValueOnce([]);
    expect((await Page()).props.empty).toBe(true);
    findProjects.mockResolvedValueOnce([]);
    expect((await Page()).props.empty).toBe(false);
  });
  it("mempertahankan fallback safeDb serta nilai nol ketika pembacaan gagal", async () => {
    projectCount.mockRejectedValueOnce(new Error("fixture unavailable"));
    findActivity.mockRejectedValueOnce(new Error("fixture unavailable"));
    const page = await Page();
    expect(page.props.stats.props).toEqual({ active: 0, pending: 0, spent: 0 });
    expect(page.props.empty).toBe(true);
  });
  it("memiliki metadata dan tetap menyediakan skeleton dashboard yang sudah ada", () => {
    expect(metadata.title).toBe("Ringkasan");
    expect(metadata.description).toContain("proyek");
    expect(renderToStaticMarkup(<Loading />)).toContain('data-slot="skeleton"');
  });
});
