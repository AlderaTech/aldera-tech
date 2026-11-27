import { describe, expect, it } from "bun:test";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSubContent,
} from "./dropdown-menu";

describe("Kontrak styling dropdown", () => {
  it("memberi penanda pada content portal tanpa menghilangkan props dan anak", () => {
    const content = DropdownMenuContent({
      sideOffset: 9,
      "aria-label": "Menu akun",
      children: "Konten akun",
    });
    expect(content.props.children.props["data-slot"]).toBe(
      "dropdown-menu-content"
    );
    expect(content.props.children.props.sideOffset).toBe(9);
    expect(content.props.children.props.children).toBe("Konten akun");
    expect(content.props.children.props["aria-label"]).toBe("Menu akun");
    expect(DropdownMenuSubContent({}).props["data-slot"]).toBe(
      "dropdown-menu-sub-content"
    );
  });
  it("mempertahankan aksi, disabled dan varian destruktif pada item", () => {
    const onSelect = () => {};
    const item = DropdownMenuItem({
      onSelect,
      disabled: true,
      variant: "destructive",
    });
    expect(item.props["data-slot"]).toBe("dropdown-menu-item");
    expect(item.props.onSelect).toBe(onSelect);
    expect(item.props.disabled).toBe(true);
    expect(item.props["data-variant"]).toBe("destructive");
  });
});
