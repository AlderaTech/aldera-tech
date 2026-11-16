import { expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ADMIN_ROUTES } from "@/lib/routes";
import { QueryInputError } from "./query-input-error";

it("explains an invalid query and provides a working reset route", () => {
  const html = renderToStaticMarkup(
    <QueryInputError
      message="Rentang tanggal tidak valid."
      resetHref={ADMIN_ROUTES.timesheet}
    />
  );
  expect(html).toContain('role="alert"');
  expect(html).toContain("Rentang tanggal tidak valid.");
  expect(html).toContain(`href="${ADMIN_ROUTES.timesheet}"`);
});
