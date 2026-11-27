import { expect, it, mock } from "bun:test";
import { requests } from "@/app/_test-utils/image-quality";
import { renderToStaticMarkup } from "react-dom/server";
import { AUTH_ROUTES } from "@/lib/routes";
let params = new URLSearchParams();
const submit = mock();
mock.module("next/navigation", () => ({
  useRouter: () => ({ replace: mock(), push: mock() }),
  useSearchParams: () => params,
}));
mock.module("@/lib/actions/password-reset", () => ({
  resetPasswordAction: submit,
}));
const { ResetFormContent } = await import("./reset-form-content");
it("preserves missing-token recovery and password-manager fields without submitting", () => {
  expect(renderToStaticMarkup(<ResetFormContent />)).toContain(
    AUTH_ROUTES.forgotPassword
  );
  params = new URLSearchParams({ token: "fixture-token" });
  const html = renderToStaticMarkup(<ResetFormContent />);
  expect(html).toContain('name="token" value="fixture-token"');
  expect(html).toContain('name="password"');
  expect(html).toContain('name="confirmPassword"');
  expect(html.match(/autoComplete="new-password"/g)).toHaveLength(2);
  expect(html).toContain("text-destructive");
  expect(submit).not.toHaveBeenCalled();
  expect(requests.length).toBeGreaterThan(0);
});
