import { beforeEach, describe, expect, it, mock } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { ModelCatalogItem } from "@/lib/ai-relay-utils";
import { RELAY_SECTIONS } from "./_data/relay-sections";

let currentTab = "keys";

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
  useSearchParams: () => new URLSearchParams({ tab: currentTab }),
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
const initialProps = {
  initialBalance: 150000,
  initialTransactions: [],
  initialKeys: [],
  initialAnalytics: {
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    totalTokens: 0,
    totalCostIdr: 0,
    totalRequests: 0,
    dailyStats: [],
    modelBreakdown: {},
  },
  initialLogs: [],
  catalog: mockCatalog,
  healthMetrics: [],
};

describe("AiRelayClientView Tab Deep-Linking & UI", () => {
  beforeEach(() => {
    currentTab = "keys";
  });
  it("merender seluruh tab dari URL tanpa mengganti saldo atau data kosong", () => {
    for (const section of RELAY_SECTIONS) {
      currentTab = section.value;
      const html = renderToStaticMarkup(
        <AiRelayClientView {...initialProps} />
      );
      expect(html).toContain(
        `<h2>${section.label.replaceAll("&", "&amp;")}</h2>`
      );
      expect(html).toContain("data-relay-balance");
      expect(html).toContain("150.000");
      const panels = [
        ...html.matchAll(/<div\b[^>]*role="tabpanel"[^>]*>/g),
      ].map((match) => match[0]);
      expect(
        panels.filter((tag) => tag.includes('data-state="active"'))
      ).toHaveLength(1);
      expect(html).not.toContain("100% Online");
    }
  });
  it("tetap menyediakan empty state katalog dan status tanpa metrik buatan", () => {
    currentTab = "catalog";
    const html = renderToStaticMarkup(
      <AiRelayClientView {...initialProps} catalog={[]} initialBalance={0} />
    );
    expect(html).toContain("Tidak ada model yang cocok");
    expect(html).toContain("Rp");
    currentTab = "health";
    expect(
      renderToStaticMarkup(<AiRelayClientView {...initialProps} />)
    ).toContain("Belum ada data");
  });
  it("mempertahankan ID lengkap, tarif, dan konteks pada katalog besar", () => {
    currentTab = "catalog";
    const catalog = Array.from({ length: 48 }, (_, index) => ({
      ...mockCatalog[0],
      id: `${mockCatalog[0].id}-${"extended-".repeat(12)}${index}`,
      displayName: `${mockCatalog[0].displayName} ${index}`,
    }));
    const html = renderToStaticMarkup(
      <AiRelayClientView {...initialProps} catalog={catalog} />
    );
    expect(html.match(/data-relay-model-card/g)).toHaveLength(48);
    expect(html).toContain(`title="${catalog[47].id}"`);
    expect(html).toContain(
      `aria-label="Salin ID model ${catalog[47].displayName}"`
    );
    expect(html).toContain("48.000");
    expect(html).toContain("240.000");
    expect(html).toContain("200.000");
    expect(html).toContain("/ 1M token");
  });
  it("renders workspace and tab triggers correctly", () => {
    const html = renderToStaticMarkup(
      <AiRelayClientView
        initialBalance={150000}
        initialTransactions={[]}
        initialKeys={[]}
        initialAnalytics={initialProps.initialAnalytics}
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
