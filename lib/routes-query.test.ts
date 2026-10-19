import { describe, expect, it } from "bun:test";
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";

describe("Route builders for query parameters", () => {
  it("generates correct tab query URLs for ADMIN_ROUTES", () => {
    expect(ADMIN_ROUTES.projectDetailTab("proj-123", "tasks")).toBe(
      "/admin/projects/proj-123?tab=tasks"
    );
    expect(ADMIN_ROUTES.settingsTab("contact")).toBe(
      "/admin/settings?tab=contact"
    );
    expect(ADMIN_ROUTES.telegramBotTab("payment-methods")).toBe(
      "/admin/telegram-bot?tab=payment-methods"
    );
    expect(ADMIN_ROUTES.aiRelayTab("pricing")).toBe(
      "/admin/ai-relay?tab=pricing"
    );
    expect(ADMIN_ROUTES.calculatorTab("features")).toBe(
      "/admin/calculator?tab=features"
    );
  });

  it("generates correct query URLs for DASHBOARD_ROUTES", () => {
    expect(DASHBOARD_ROUTES.projectDetailTab("proj-456", "invoices")).toBe(
      "/dashboard/projects/proj-456?tab=invoices"
    );
    expect(DASHBOARD_ROUTES.aiRelayTab("tokens")).toBe(
      "/dashboard/ai-relay?tab=tokens"
    );
    expect(
      DASHBOARD_ROUTES.invoicesWithParams({ status: "UNPAID", page: 2 })
    ).toBe("/dashboard/invoices?status=UNPAID&page=2");
    expect(
      DASHBOARD_ROUTES.ordersWithParams({ status: "PENDING", page: 3 })
    ).toBe("/dashboard/orders?status=PENDING&page=3");
  });

  it("generates correct query URLs for ADMIN_ROUTES with params", () => {
    expect(
      ADMIN_ROUTES.projectsWithParams({
        q: "aldera",
        status: "IN_PROGRESS",
        page: 2,
        sort: "budget_desc",
      })
    ).toBe(
      "/admin/projects?q=aldera&status=IN_PROGRESS&page=2&sort=budget_desc"
    );

    expect(
      ADMIN_ROUTES.invoicesWithParams({
        q: "INV-2026",
        status: "PAID",
        page: 1,
      })
    ).toBe("/admin/invoices?q=INV-2026&status=PAID");

    expect(
      ADMIN_ROUTES.ordersWithParams({
        q: "tech",
        status: "PENDING",
        page: 2,
      })
    ).toBe("/admin/orders?q=tech&status=PENDING&page=2");

    expect(
      ADMIN_ROUTES.proposalsWithParams({
        q: "prop",
        status: "SENT",
        page: 3,
      })
    ).toBe("/admin/proposals?q=prop&status=SENT&page=3");

    expect(
      ADMIN_ROUTES.blogWithParams({
        q: "nextjs",
        status: "PUBLISHED",
        page: 1,
      })
    ).toBe("/admin/blog?q=nextjs&status=PUBLISHED");

    expect(
      ADMIN_ROUTES.filesWithParams({
        q: "logo",
        type: "image",
        page: 2,
      })
    ).toBe("/admin/files?q=logo&type=image&page=2");

    expect(
      ADMIN_ROUTES.auditWithParams({
        q: "admin",
        action: "UPDATE",
        page: 1,
      })
    ).toBe("/admin/audit?q=admin&action=UPDATE");

    expect(
      ADMIN_ROUTES.testimonialsWithParams({
        q: "andi",
        status: "published",
        page: 2,
      })
    ).toBe("/admin/testimonials?q=andi&status=published&page=2");

    expect(
      ADMIN_ROUTES.portfolioWithParams({
        q: "fintech",
        status: "published",
        page: 1,
      })
    ).toBe("/admin/portfolio?q=fintech&status=published");
  });
});
