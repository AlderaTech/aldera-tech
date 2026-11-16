import { mock } from "bun:test";
import type { ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { AccountBindingState } from "../_hooks/use-account-binding";
mock.module("server-only", () => ({}));
export const actions = {
  getBindingStatusAction: mock(async () => ({ isBound: false })),
  generateBindingTokenAction: mock(),
  unlinkTelegramAccountAction: mock(),
};
mock.module("@/lib/actions/binding", () => actions);
const { useAccountBinding } = await import("../_hooks/use-account-binding");
export function bindingMarkup(
  Component: ComponentType<{ state: AccountBindingState }>,
  overrides: Partial<AccountBindingState> = {}
) {
  function Harness() {
    const state = useAccountBinding();
    return <Component state={{ ...state, loading: false, ...overrides }} />;
  }
  return renderToStaticMarkup(<Harness />);
}
