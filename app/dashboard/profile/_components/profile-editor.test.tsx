import { describe, expect, it } from "bun:test";
import { Children, isValidElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProfileEditor } from "./profile-editor";
import { ProfileForm } from "./profile-form";
import type { ProfileValues } from "../_types/profile";

describe("Edit profil asli dalam dialog", () => {
  it("merender pemicu Edit Profil yang aksesibel tanpa formulir ganda", () => {
    const html = renderToStaticMarkup(
      <ProfileEditor
        defaultValues={{ name: "Pengguna Uji", phone: "+6281230000000" }}
      />
    );
    expect(html).toContain(">Edit Profil<");
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain("<form");
  });
  it("meneruskan nilai akun asli ke ProfileForm tanpa nilai demo", () => {
    const values = { name: "Nama Asli", phone: "" };
    const editor = ProfileEditor({ defaultValues: values });
    const dialog = Children.toArray(editor.props.children)[1];
    if (!isValidElement<{ children: ReactNode }>(dialog))
      throw new Error("Dialog hilang");
    const form = dialog.props.children;
    expect(isValidElement<{ defaultValues: ProfileValues }>(form)).toBe(true);
    if (!isValidElement<{ defaultValues: ProfileValues }>(form))
      throw new Error("Form hilang");
    expect(form.type).toBe(ProfileForm);
    expect(form.props.defaultValues).toEqual(values);
  });
});
