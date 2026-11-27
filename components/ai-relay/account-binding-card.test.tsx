import { expect, it } from "bun:test";
import { bindingMarkup, actions } from "./_test-utils/binding-fixture";
const { AccountBindingView } = await import("./account-binding-card");
it("keeps loading, errors and disconnected state distinct", () => {
  expect(bindingMarkup(AccountBindingView, { loading: true })).toContain(
    'data-slot="skeleton"'
  );
  const failed = bindingMarkup(AccountBindingView, {
    status: { isBound: false, error: "Offline" },
  });
  expect(failed).toContain('role="alert"');
  expect(failed).toContain("Coba lagi");
  expect(failed).not.toContain("Belum Terhubung");
  expect(failed).not.toContain("<h1");
  expect(bindingMarkup(AccountBindingView)).toContain(
    "Tautkan Akun Telegram Anda"
  );
  expect(actions.generateBindingTokenAction).not.toHaveBeenCalled();
});
