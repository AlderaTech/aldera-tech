import { describe, it, expect } from "bun:test";
import { ClientCredentialsDialog } from "./client-credentials-dialog";
describe("One-time client credentials", () => {
  it("only opens for newly created accounts and clears through the close callback", () => {
    const closed = ClientCredentialsDialog({
      credentials: null,
      onClose: () => {},
    });
    expect(closed.props.open).toBe(false);
    let closes = 0;
    const opened = ClientCredentialsDialog({
      credentials: {
        email: "fixture@example.invalid",
        password: "test-only-password",
      },
      onClose: () => {
        closes++;
      },
    });
    expect(opened.props.open).toBe(true);
    opened.props.onOpenChange?.(false);
    expect(closes).toBe(1);
  });
});
