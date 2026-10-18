import { beforeEach, describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AUTH_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import { getStudioDashboardSection } from "@/components/dashboard/studio-dashboard-routes";
import type { ProfileUser } from "./_types/profile";

const user: ProfileUser = {
  id: "test-profile-user",
  name: "Pengguna Uji",
  email: "profile@example.test",
  roles: ["CLIENT"],
  phone: "+6281230000000",
  avatar: null,
  createdAt: new Date("2026-01-02T00:00:00Z"),
};
const findUnique = mock(async (): Promise<ProfileUser | null> => user);
const getSession = mock(async (): Promise<{ user: { id: string } } | null> => ({
  user: { id: user.id },
}));
const redirect = mock((path: string): never => {
  throw new Error(`redirect:${path}`);
});
mock.module("@/auth", () => ({ auth: getSession }));
mock.module("@/lib/prisma", () => ({ prisma: { user: { findUnique } } }));
mock.module("@/lib/actions/profile", () => ({ updateProfile: mock() }));
mock.module("next/navigation", () => ({
  redirect,
  useRouter: () => ({ refresh: mock() }),
}));
const { default: Page, metadata } = await import("./page");
const { ProfileContent } = await import("./_components/profile-content");
const { default: Loading } = await import("./loading");

describe("Halaman Profil Saya", () => {
  beforeEach(() => {
    findUnique.mockReset();
    findUnique.mockResolvedValue(user);
    getSession.mockReset();
    getSession.mockResolvedValue({ user: { id: user.id } });
    redirect.mockClear();
  });
  it("memakai sesi aktif serta tujuan login asli jika tidak terautentikasi", async () => {
    expect(await Page()).toBeDefined();
    getSession.mockResolvedValueOnce(null);
    await expect(Page()).rejects.toThrow(`redirect:${AUTH_ROUTES.login}`);
    expect(redirect).toHaveBeenCalledWith(AUTH_ROUTES.login);
  });
  it("mempertahankan query, field yang dipilih, dan nilai awal dari pengguna", async () => {
    const html = renderToStaticMarkup(
      await ProfileContent({ userId: user.id })
    );
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        roles: true,
        avatar: true,
        phone: true,
        createdAt: true,
      },
    });
    expect(html).toContain(user.email);
    expect(html).toContain(`value="${user.name}"`);
    expect(html).toContain(`value="${user.phone}"`);
  });
  it("tidak menampilkan form kosong ketika data tidak tersedia atau query gagal", async () => {
    findUnique.mockResolvedValueOnce(null);
    let html = renderToStaticMarkup(await ProfileContent({ userId: user.id }));
    expect(html).toContain("Profil belum dapat dimuat");
    expect(html).toContain("Coba lagi");
    expect(html).not.toContain('name="name"');
    findUnique.mockRejectedValueOnce(new Error("mock service unavailable"));
    html = renderToStaticMarkup(await ProfileContent({ userId: user.id }));
    expect(html).toContain('role="alert"');
    expect(html).not.toContain("Profil diperbarui");
  });
  it("mendukung telepon kosong, metadata, loading, dan tema khusus rute profil", async () => {
    findUnique.mockResolvedValueOnce({ ...user, phone: null });
    const html = renderToStaticMarkup(
      await ProfileContent({ userId: user.id })
    );
    expect(html).toMatch(/name="phone"[^>]*value=""/);
    expect(metadata.title).toBe("Profil Saya");
    expect(metadata.description).toContain("profil");
    expect(renderToStaticMarkup(<Loading />)).toContain(
      'aria-label="Memuat profil"'
    );
    expect(getStudioDashboardSection(DASHBOARD_ROUTES.profile)).toBe(
      "Profil Saya"
    );
    expect(getStudioDashboardSection(DASHBOARD_ROUTES.settings)).toBeNull();
  });
});
