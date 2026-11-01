import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Children, isValidElement, type ReactNode } from "react";
import { ProfileSkeleton } from "./profile-skeleton";
describe("Skeleton susunan Profil", () => {
  it("menampilkan skeleton kartu identitas dan kartu formulir profil tanpa panel demo", () => {
    const element = ProfileSkeleton();
    const children = Children.toArray(element.props.children);
    expect(children).toHaveLength(2);
    const html = renderToStaticMarkup(element);
    expect(html).toContain('aria-label="Memuat profil"');
    expect(html).toContain('role="status"');
    expect(html).not.toContain("Demo");
    if (!isValidElement<{ children: ReactNode }>(children[1]))
      throw new Error("Kartu formulir skeleton hilang");
    expect(Children.toArray(children[1].props.children)).toHaveLength(3);
  });
});
