import { expect, it } from "bun:test";
import { bindingMarkup, actions } from "../_test-utils/binding-fixture";
const { BindingLinkedPanel } = await import("./binding-linked-panel");
it("renders only the supplied Telegram identity and preserves unlink confirmation", () => {
  const html = bindingMarkup(BindingLinkedPanel, {
    status: { isBound: true, telegramId: "12345", telegramUsername: "fixture" },
  });
  expect(html).toContain("12345");
  expect(html).toContain("@fixture");
  expect(html).toContain("Putuskan Tautan");
  expect(actions.unlinkTelegramAccountAction).not.toHaveBeenCalled();
});
