import { describe, expect, it, mock } from "bun:test";
import { readFileSync } from "node:fs";
import { Children, isValidElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AvatarImage } from "@/components/ui/avatar";
import { ROLE_LABELS } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import type { ProfileUser } from "../_types/profile";

mock.module("@/lib/actions/profile", () => ({ updateProfile: mock() }));
const { ProfileForm } = await import("./profile-form");
const { ProfileIdentity } = await import("./profile-identity");
const { ProfileFrame } = await import("./profile-frame");
const { ProfileSkeleton } = await import("./profile-skeleton");
const { ProfileActivityPanel } = await import("./profile-activity-panel");

function findAvatar(
  node: ReactNode
): { src?: string; alt?: string } | undefined {
  for (const child of Children.toArray(node)) {
    if (
      !isValidElement<{ children?: ReactNode; src?: string; alt?: string }>(
        child
      )
    )
      continue;
    if (child.type === AvatarImage) return child.props;
    const found = findAvatar(child.props.children);
    if (found) return found;
  }
}

const user: ProfileUser = {
  id: "ui-test-user",
  name: "Maya Putri",
  email: "maya@example.test",
  phone: null,
  roles: ["CLIENT", "DEVELOPER"],
  avatar: null,
  createdAt: new Date("2026-02-03T00:00:00Z"),
};

describe("Identitas dan formulir profil", () => {
  it("memakai identitas, peran, tanggal, dan inisial pengguna tanpa status verifikasi buatan", () => {
    const html = renderToStaticMarkup(<ProfileIdentity user={user} />);
    for (const value of [
      user.name,
      user.email,
      "MP",
      formatDate(user.createdAt),
      ROLE_LABELS.CLIENT,
      ROLE_LABELS.DEVELOPER,
    ])
      expect(html).toContain(value);
    expect(html).toContain("tidak dapat diedit");
    expect(html).not.toContain("Terverifikasi");
    expect(html).not.toContain('type="file"');
    expect(html).not.toContain("Hapus foto");
  });
  it("mempertahankan sumber dan alt foto tersimpan; maskot tidak menggantikan avatar", () => {
    const avatar = "/uploads/test-profile-avatar.webp";
    const image = findAvatar(ProfileIdentity({ user: { ...user, avatar } }));
    expect(image?.src).toBe(avatar);
    expect(image?.alt).toBe(user.name);
    expect(findAvatar(ProfileIdentity({ user }))).toBeUndefined();
  });
  it("mempertahankan field dan format data dengan label, autocomplete, serta status wajib/opsional", () => {
    const html = renderToStaticMarkup(
      <ProfileForm
        defaultValues={{ name: user.name, phone: "+6281230000000" }}
      />
    );
    expect(html).toContain('id="name"');
    const nameInput = html.match(/<input[^>]*id="name"[^>]*>/)?.[0];
    expect(nameInput).toContain('name="name"');
    expect(nameInput).toContain('required=""');
    expect(html).toContain('autoComplete="name"');
    expect(html).toContain('id="phone"');
    expect(html).toContain('name="phone"');
    expect(html).toContain('autoComplete="tel"');
    expect(html).toContain('inputMode="tel"');
    expect(html).toContain('placeholder="+62..."');
    expect(html).toContain("(Opsional)");
    expect(html).toContain("Simpan Perubahan");
    expect(html).toContain('aria-busy="false"');
    expect(html).not.toContain('name="email"');
    expect(html).not.toContain('type="password"');
    expect(html).not.toContain("Profil diperbarui");
  });
  it("menjaga nama/email panjang, kontak kosong, dan loading tanpa mengarang data", () => {
    const longUser = {
      ...user,
      name: "Pengguna dengan identitas panjang ".repeat(8),
      email: `${"pengguna".repeat(20)}@example.test`,
    };
    const html = renderToStaticMarkup(<ProfileIdentity user={longUser} />);
    expect(html).toContain(longUser.name);
    expect(html).toContain(longUser.email);
    const frame = renderToStaticMarkup(
      <ProfileFrame>
        <ProfileSkeleton />
      </ProfileFrame>
    );
    expect(frame).toContain("Profil Saya");
    expect(frame).toContain('role="status"');
    expect(frame).not.toContain(user.email);
  });
  it("memperjelas panel dan formulir dalam tema lokal yang konsisten dengan Pengaturan", () => {
    const css = readFileSync(
      new URL("./profile.module.css", import.meta.url),
      "utf8"
    );
    const frame = renderToStaticMarkup(<ProfileFrame>Konten</ProfileFrame>);
    expect(frame).toContain("data-profile-page");
    expect(css).toContain("var(--overview-ink) 18%");
    expect(css).toContain("var(--overview-ink) 72%");
    expect(css).toContain("@container (min-width: 54rem)");
    const previewCss = readFileSync(
      new URL("./profile-preview.module.css", import.meta.url),
      "utf8"
    );
    expect(previewCss).toContain("pointer-events: none;");
    expect(css).toContain("prefers-reduced-motion");
    expect(css).toMatch(/\[data-slot="skeleton"\]\s*\{\s*animation: none;/);
    const input = css.match(/\.field input\s*\{([^}]+)\}/)?.[1];
    expect(input).toContain("font-size: 1rem;");
    expect(input).toContain("height: 48px;");
    const formCard = css.match(/\.formCard\s*\{([^}]+)\}/)?.[1];
    expect(formCard).toContain("overflow: visible;");
    const workspace = css.match(/\.workspace\s*\{([^}]+)\}/)?.[1];
    expect(workspace).toContain("display: grid;");
    expect(css).toContain(".identityDetails");
    expect(css).not.toMatch(/:global|(?:^|\n)(?:body|html)\s*\{/);
  });
  it("memisahkan identitas asli, formulir, dan maskot aktivitas demo", () => {
    const identity = renderToStaticMarkup(
      <ProfileIdentity user={user} editAction={<button>Edit Profil</button>} />
    );
    const form = renderToStaticMarkup(
      <ProfileForm defaultValues={{ name: user.name, phone: "" }} />
    );
    expect(identity).not.toContain("aldera-relay-assistant");
    expect(identity).toContain("aldera-profile-guide");
    expect(identity).toContain('data-slot="avatar-fallback"');
    expect(form).not.toContain("aldera-relay-assistant");
    expect(renderToStaticMarkup(<ProfileActivityPanel />)).toContain(
      "aldera-profile-activity"
    );
    expect(form).toContain('id="personal-heading"');
    expect(form).toContain('id="contact-heading"');
    expect(form).toContain('id="name-hint"');
    expect(form).not.toMatch(/>0[12]</);
  });
});
