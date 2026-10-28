import { beforeEach, describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Children, isValidElement, type ReactNode } from "react";
import { AUTH_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import { getStudioDashboardSection } from "@/components/dashboard/studio-dashboard-routes";
import type { ProfileUser } from "./_types/profile";
import type { ProfileValues } from "./_types/profile";

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
const { ProfileEditor } = await import("./_components/profile-editor");

function findEditorValues(node: ReactNode): ProfileValues | undefined {
  for (const child of Children.toArray(node)) {
    if (
      !isValidElement<{
        children?: ReactNode;
        editAction?: ReactNode;
        defaultValues?: ProfileValues;
      }>(child)
    )
      continue;
    if (child.type === ProfileEditor) return child.props.defaultValues;
    const found =
      findEditorValues(child.props.children) ??
      findEditorValues(child.props.editAction);
    if (found) return found;
  }
}

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
    const content = await ProfileContent({ userId: user.id });
    const html = renderToStaticMarkup(content);
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
    expect(html).toContain(user.phone!);
    expect(html).toContain("Edit Profil");
    expect(findEditorValues(content)).toEqual({
      name: user.name,
      phone: user.phone,
    });
    expect(html).not.toContain("<form");
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
    const content = await ProfileContent({ userId: user.id });
    const html = renderToStaticMarkup(content);
    expect(findEditorValues(content)).toEqual({ name: user.name, phone: "" });
    expect(html).toContain("Belum ditambahkan");
    expect(metadata.title).toBe("Profil Saya");
    expect(metadata.description).toContain("profil");
    expect(renderToStaticMarkup(<Loading />)).toContain(
      'aria-label="Memuat profil"'
    );
    expect(getStudioDashboardSection(DASHBOARD_ROUTES.profile)).toBe(
      "Profil Saya"
    );
    expect(getStudioDashboardSection(DASHBOARD_ROUTES.settings)).toBe(
      "Pengaturan"
    );
    expect(
      getStudioDashboardSection(`${DASHBOARD_ROUTES.profile}/detail`)
    ).toBeNull();
  });
});
