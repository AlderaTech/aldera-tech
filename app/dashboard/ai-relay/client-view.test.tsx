import { describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { ModelCatalogItem } from "@/lib/ai-relay-utils";

mock.module("server-only", () => ({}));
mock.module("next/image", () => ({
  default: ({
    src,
    alt,
    loading = "lazy",
    fill,
    ...props
  }: Record<string, unknown>) => {
    void fill;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={typeof src === "string" ? src : "/mock-img.webp"}
        alt={typeof alt === "string" ? alt : ""}
        loading={loading as "lazy" | "eager"}
        {...props}
      />
    );
  },
}));

mock.module("next/navigation", () => ({
  useRouter: () => ({ refresh: mock(), replace: mock(), push: mock() }),
  usePathname: () => "/dashboard/ai-relay",
  useSearchParams: () => new URLSearchParams("tab=keys"),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const mockCatalog: ModelCatalogItem[] = [
  {
    id: "claude-3-5-sonnet-20241022",
    displayName: "Claude 3.5 Sonnet",
    category: "Coding",
    contextWindow: 200000,
    inputPricePerM: 48000,
    outputPricePerM: 240000,
    bestFor: "Coding",
    isActive: true,
  },
];

const { AiRelayClientView } = await import("./client-view");

describe("AiRelayClientView Tab Deep-Linking & UI", () => {
  it("renders workspace and tab triggers correctly", () => {
    const html = renderToStaticMarkup(
      <AiRelayClientView
        initialBalance={150000}
        initialTransactions={[]}
        initialKeys={[]}
        initialAnalytics={{
          totalSpend: 0,
          totalTokens: 0,
          requestsCount: 0,
          averageLatencyMs: 0,
          spendByDay: [],
          tokensByModel: [],
        }}
        initialLogs={[]}
        catalog={mockCatalog}
        healthMetrics={[]}
      />
    );

    expect(html).toContain("Katalog Model");
    expect(html).toContain("Playground Chat");
    expect(html).toContain("API Keys");
    expect(html).toContain("Saldo &amp; Ledger");
    expect(html).toContain("Status &amp; Latensi");
  });
});
