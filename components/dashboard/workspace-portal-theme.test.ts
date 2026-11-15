import { describe, expect, it } from "bun:test";
import { mountWorkspacePortalTheme } from "./workspace-portal-theme";

function target() {
  const classes = new Set(["existing"]);
  const attributes = new Map<string, string>();
  return {
    classes,
    attributes,
    classList: {
      contains: (name: string) => classes.has(name),
      add: (...names: string[]) => names.forEach((name) => classes.add(name)),
      remove: (...names: string[]) =>
        names.forEach((name) => classes.delete(name)),
    },
    getAttribute: (name: string) => attributes.get(name) ?? null,
    setAttribute: (name: string, value: string) => {
      attributes.set(name, value);
    },
    removeAttribute: (name: string) => {
      attributes.delete(name);
    },
  };
}

describe("Tema portal workspace", () => {
  it("menerapkan tema pengguna ke portal dan membersihkannya saat kembali ke website", () => {
    const body = target();
    const cleanup = mountWorkspacePortalTheme(
      body,
      ["existing", "tokens", "controls"],
      "data-dashboard-studio"
    );
    expect(body.classes.has("tokens")).toBe(true);
    expect(body.getAttribute("data-dashboard-studio")).toBe("true");
    cleanup();
    expect([...body.classes]).toEqual(["existing"]);
    expect(body.getAttribute("data-dashboard-studio")).toBeNull();
  });
  it("mempertahankan kelas bersama selama perpindahan layout admin dan pengguna", () => {
    const body = target();
    body.setAttribute("data-admin-studio", "previous");
    const admin = mountWorkspacePortalTheme(
      body,
      ["tokens", "admin"],
      "data-admin-studio"
    );
    const user = mountWorkspacePortalTheme(
      body,
      ["tokens", "user"],
      "data-dashboard-studio"
    );
    admin();
    expect(body.classes.has("tokens")).toBe(true);
    expect(body.classes.has("admin")).toBe(false);
    expect(body.getAttribute("data-admin-studio")).toBe("previous");
    user();
    expect([...body.classes]).toEqual(["existing"]);
  });
  it("tidak melepas atribut ketika layout pengganti sudah menggunakannya", () => {
    const body = target();
    const previous = mountWorkspacePortalTheme(
      body,
      ["tokens"],
      "data-admin-studio"
    );
    const next = mountWorkspacePortalTheme(
      body,
      ["tokens"],
      "data-admin-studio"
    );
    previous();
    expect(body.getAttribute("data-admin-studio")).toBe("true");
    next();
    expect(body.getAttribute("data-admin-studio")).toBeNull();
    expect(body.classes.has("tokens")).toBe(false);
  });
});
