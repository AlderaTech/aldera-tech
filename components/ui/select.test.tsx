import { describe, expect, it } from "bun:test";
import { SelectContent, SelectTrigger, SelectItem } from "./select";

describe("Kontrak styling pilihan", () => {
  it("mempertahankan nilai, ID, disabled dan event pada kontrol", () => {
    const onKeyDown = () => {};
    const trigger = SelectTrigger({ id: "model", disabled: true, onKeyDown });
    expect(trigger.props["data-slot"]).toBe("select-trigger");
    expect(trigger.props.id).toBe("model");
    expect(trigger.props.disabled).toBe(true);
    expect(trigger.props.onKeyDown).toBe(onKeyDown);
    const item = SelectItem({ value: "model-id", children: "Model asli" });
    expect(item.props["data-slot"]).toBe("select-item");
    expect(item.props.value).toBe("model-id");
  });
  it("menandai portal tanpa mengubah posisi popup", () => {
    const content = SelectContent({
      position: "item-aligned",
      children: "Pilihan",
    });
    expect(content.props.children.props["data-slot"]).toBe("select-content");
    expect(content.props.children.props.position).toBe("item-aligned");
  });
});
