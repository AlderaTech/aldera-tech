import { describe, expect, it } from "bun:test";
import { Children, isValidElement, type ReactNode } from "react";
import { ProfileDialogContent } from "./profile-dialog";

describe("Dialog privat Profil", () => {
  it("memakai tema terisolasi dan menyertakan judul, deskripsi, serta konten", () => {
    const element = ProfileDialogContent({
      title: "Judul uji",
      description: "Deskripsi uji",
      children: <p>Isi uji</p>,
      className: "local-editor",
    });
    expect(element.props["data-profile-dialog"]).toBe(true);
    expect(element.props.className).toContain("local-editor");
    const children = Children.toArray(element.props.children);
    const header = children[0];
    expect(isValidElement<{ children: ReactNode }>(header)).toBe(true);
    if (!isValidElement<{ children: ReactNode }>(header))
      throw new Error("Header hilang");
    const labels = Children.toArray(header.props.children);
    expect(
      labels.map((item) =>
        isValidElement<{ children: ReactNode }>(item)
          ? item.props.children
          : item
      )
    ).toEqual(["Judul uji", "Deskripsi uji"]);
    expect(children).toHaveLength(2);
  });
});
