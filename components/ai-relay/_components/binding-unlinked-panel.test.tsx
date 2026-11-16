import { expect, it } from "bun:test";
import { bindingMarkup, actions } from "../_test-utils/binding-fixture";
const { BindingUnlinkedPanel } = await import("./binding-unlinked-panel");
it("does not invent a token and displays the returned code only when available", () => {
  const empty = bindingMarkup(BindingUnlinkedPanel);
  expect(empty).toContain("Tautkan Akun Telegram Anda");
  expect(empty).not.toContain("123456");
  const token = bindingMarkup(BindingUnlinkedPanel, {
    status: {
      isBound: false,
      activeToken: {
        token: "fixture",
        code: "123456",
        deepLink: "https://t.me/fixture?start=fixture",
        expiresAt: "2026-12-01T00:00:00Z",
      },
    },
  });
  expect(token).toContain("123456");
  expect(token).toContain("https://t.me/fixture?start=fixture");
  expect(actions.generateBindingTokenAction).not.toHaveBeenCalled();
  expect(bindingMarkup(BindingUnlinkedPanel, { submitting: true })).toContain(
    "disabled"
  );
});
