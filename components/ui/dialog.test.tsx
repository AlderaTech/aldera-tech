import { describe, expect, it } from "bun:test";
import { DialogContent } from "./dialog";

describe("Dialog standar", () => {
  it("mempertahankan portal, ID dan event serta memberi label tutup Indonesia", () => {
    const onEscapeKeyDown = () => {};
    const dialog = DialogContent({
      id: "dialog-uji",
      onEscapeKeyDown,
      children: "Isi asli",
    });
    const content = dialog.props.children[1];
    expect(content.props.id).toBe("dialog-uji");
    expect(content.props.onEscapeKeyDown).toBe(onEscapeKeyDown);
    expect(content.props.children[0]).toBe("Isi asli");
    const close = content.props.children[1];
    expect(close.props["data-slot"]).toBe("dialog-close");
    expect(close.props.children[1].props.children).toBe("Tutup");
  });
});
