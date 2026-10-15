import { describe, it, expect } from "bun:test";
import { metadata } from "./page";
import AiRelayPublicPage from "./page";
import { PUBLIC_ROUTES, AUTH_ROUTES } from "@/lib/routes";
import { publicNavLinks, footerSections } from "@/lib/nav-config";
import {
  filterModelCatalog,
  generateIdePresetConfig,
  calculateMonthlyCost,
  DEFAULT_MODEL_CATALOG,
  type ModelCatalogItem,
} from "@/lib/ai-relay-utils";

describe("Public Showcase & Marketing Page (F17)", () => {
  // ==========================================================================
  // 1. SEO Metadata Verification
  // ==========================================================================
  describe("SEO Metadata", () => {
    it("exports valid metadata with optimized title length", () => {
      expect(metadata).toBeDefined();
      const title = String(metadata.title);
      expect(title).toContain("Aldera AI Relay");
      expect(title).toContain("Pembayaran IDR");
      expect(title.length).toBeLessThanOrEqual(70);
    });

    it("includes compelling Indonesian description with key model names and Rupiah QRIS", () => {
      const description = String(metadata.description);
      expect(description).toContain("Claude, GPT-4o, dan DeepSeek");
      expect(description).toContain("Rupiah & QRIS");
      expect(description).toContain("kartu kredit luar negeri");
    });

    it("sets canonical URL to PUBLIC_ROUTES.aiRelay", () => {
      expect(metadata.alternates).toBeDefined();
      expect(metadata.alternates?.canonical).toBe(PUBLIC_ROUTES.aiRelay);
      expect(PUBLIC_ROUTES.aiRelay).toBe("/ai-relay");
    });
  });

  // ==========================================================================
  // 2. Navigation & Route Consistency
  // ==========================================================================
  describe("Public Navigation & Route Constants", () => {
    it("ensures PUBLIC_ROUTES.aiRelay is correctly registered", () => {
      expect(PUBLIC_ROUTES.aiRelay).toBe("/ai-relay");
    });

    it("includes AI Relay in publicNavLinks for main navbar", () => {
      const aiRelayNav = publicNavLinks.find(
        (link) => link.href === PUBLIC_ROUTES.aiRelay
      );
      expect(aiRelayNav).toBeDefined();
      expect(aiRelayNav?.label).toBe("AI Relay");
    });

    it("includes AI Relay in footerSections under Sumber Daya", () => {
      const resourcesSection = footerSections.find(
        (sec) => sec.title === "Sumber Daya"
      );
      expect(resourcesSection).toBeDefined();
      const aiRelayFooter = resourcesSection?.links.find(
        (link) => link.href === PUBLIC_ROUTES.aiRelay
      );
      expect(aiRelayFooter).toBeDefined();
      expect(aiRelayFooter?.label).toContain("AI Relay");
    });

    it("verifies registration and login CTAs route to standard auth routes", () => {
      expect(AUTH_ROUTES.register).toBe("/register");
      expect(AUTH_ROUTES.login).toBe("/login");
    });
  });

  // ==========================================================================
  // 3. Server Page Component & Catalog Integration
  // ==========================================================================
  describe("Server Page Component & Catalog Loader", () => {
    it("renders page component returning valid React element", async () => {
      const jsx = await AiRelayPublicPage();
      expect(jsx).toBeDefined();
      expect(jsx.type).toBeDefined();
      expect(jsx.props).toBeDefined();
      expect(Array.isArray(jsx.props.initialCatalog)).toBe(true);
      expect(jsx.props.initialCatalog.length).toBeGreaterThan(0);
    });

    it("ensures all models in public catalog have valid positive IDR pricing", () => {
      const activeModels = filterModelCatalog(DEFAULT_MODEL_CATALOG, {
        activeOnly: true,
      });
      expect(activeModels.length).toBeGreaterThan(0);
      for (const m of activeModels) {
        expect(m.id.length).toBeGreaterThan(0);
        expect(m.displayName.length).toBeGreaterThan(0);
        expect(m.inputPricePerM).toBeGreaterThan(0);
        expect(m.outputPricePerM).toBeGreaterThan(0);
        expect(m.contextWindow).toBeGreaterThan(0);
        expect(m.bestFor.length).toBeGreaterThan(0);
      }
    });

    it("filters out inactive models from public view", () => {
      const catalogWithInactive: ModelCatalogItem[] = [
        ...DEFAULT_MODEL_CATALOG,
        {
          id: "test-inactive-model",
          displayName: "Inactive Secret Model",
          category: "Budget",
          contextWindow: 32000,
          inputPricePerM: 1000,
          outputPricePerM: 2000,
          bestFor: "Internal only",
          isActive: false,
        },
      ];

      const publicVisible = filterModelCatalog(catalogWithInactive, {
        activeOnly: true,
      });
      expect(publicVisible.some((m) => m.id === "test-inactive-model")).toBe(false);
      expect(publicVisible.length).toBe(DEFAULT_MODEL_CATALOG.length);
    });

    it("filters catalog correctly across all 5 active categories", () => {
      const coding = filterModelCatalog(DEFAULT_MODEL_CATALOG, {
        category: "Coding",
        activeOnly: true,
      });
      expect(coding.length).toBeGreaterThan(0);
      expect(coding.every((m) => m.category === "Coding")).toBe(true);

      const reasoning = filterModelCatalog(DEFAULT_MODEL_CATALOG, {
        category: "Reasoning",
        activeOnly: true,
      });
      expect(reasoning.length).toBeGreaterThan(0);
      expect(reasoning.every((m) => m.category === "Reasoning")).toBe(true);

      const vision = filterModelCatalog(DEFAULT_MODEL_CATALOG, {
        category: "Vision",
        activeOnly: true,
      });
      expect(vision.length).toBeGreaterThan(0);
      expect(vision.every((m) => m.category === "Vision")).toBe(true);

      const fast = filterModelCatalog(DEFAULT_MODEL_CATALOG, {
        category: "Fast",
        activeOnly: true,
      });
      expect(fast.length).toBeGreaterThan(0);
      expect(fast.every((m) => m.category === "Fast")).toBe(true);

      const budget = filterModelCatalog(DEFAULT_MODEL_CATALOG, {
        category: "Budget",
        activeOnly: true,
      });
      expect(budget.length).toBeGreaterThan(0);
      expect(budget.every((m) => m.category === "Budget")).toBe(true);
    });
  });

  // ==========================================================================
  // 4. Developer Quickstart Configuration Presets
  // ==========================================================================
  describe("Developer Quickstart Configuration Presets", () => {
    const params = {
      apiKey: "sk-toko-YOUR_API_KEY",
      baseUrl: "https://aldera.tech/api/relay",
      modelId: "claude-3-5-sonnet-20241022",
    };

    it("generates valid JSON snippet for Cursor IDE", () => {
      const snippet = generateIdePresetConfig("cursor", params);
      const parsed = JSON.parse(snippet);
      expect(parsed["openai-api-key"]).toBe("sk-toko-YOUR_API_KEY");
      expect(parsed["openai-base-url"]).toBe("https://aldera.tech/api/relay/v1");
      expect(parsed.model).toBe("claude-3-5-sonnet-20241022");
    });

    it("generates valid JSON snippet for Cline", () => {
      const snippet = generateIdePresetConfig("cline", params);
      const parsed = JSON.parse(snippet);
      expect(parsed.apiProvider).toBe("openai");
      expect(parsed.openAiApiKey).toBe("sk-toko-YOUR_API_KEY");
      expect(parsed.openAiBaseUrl).toBe("https://aldera.tech/api/relay/v1");
      expect(parsed.openAiModelId).toBe("claude-3-5-sonnet-20241022");
    });

    it("generates valid JSON snippet for Roo Code", () => {
      const snippet = generateIdePresetConfig("roo", params);
      const parsed = JSON.parse(snippet);
      expect(parsed.apiProvider).toBe("openai-compatible");
      expect(parsed.apiKey).toBe("sk-toko-YOUR_API_KEY");
      expect(parsed.baseUrl).toBe("https://aldera.tech/api/relay/v1");
      expect(parsed.modelId).toBe("claude-3-5-sonnet-20241022");
    });

    it("generates valid JSON snippet for Continue.dev", () => {
      const snippet = generateIdePresetConfig("continue", params);
      const parsed = JSON.parse(snippet);
      expect(Array.isArray(parsed.models)).toBe(true);
      expect(parsed.models[0].provider).toBe("openai");
      expect(parsed.models[0].apiKey).toBe("sk-toko-YOUR_API_KEY");
      expect(parsed.models[0].apiBase).toBe("https://aldera.tech/api/relay/v1");
      expect(parsed.models[0].model).toBe("claude-3-5-sonnet-20241022");
    });

    it("generates valid JSON snippet for OpenWebUI", () => {
      const snippet = generateIdePresetConfig("openwebui", params);
      const parsed = JSON.parse(snippet);
      expect(parsed.OPENAI_API_KEY).toBe("sk-toko-YOUR_API_KEY");
      expect(parsed.OPENAI_API_BASE_URL).toBe("https://aldera.tech/api/relay/v1");
      expect(parsed.DEFAULT_MODELS).toBe("claude-3-5-sonnet-20241022");
    });
  });

  // ==========================================================================
  // 5. Cost Comparison & Monthly Simulation
  // ==========================================================================
  describe("Cost Comparison & Monthly Simulation", () => {
    it("computes monthly cost simulation accurately for realistic developer workload", () => {
      // 100 requests/day, 2000 prompt tokens, 500 completion tokens
      // Claude 3.5 Sonnet: input 48,000 / 1M, output 240,000 / 1M
      // Cost per req = (2000 * 48000 + 500 * 240000) / 1,000,000 = (96 + 120) = 216 IDR
      // Monthly (30 days) = 30 * 100 * 216 = 648,000 IDR
      const costSonnet = calculateMonthlyCost(100, 2000, 500, 48000, 240000);
      expect(costSonnet).toBe(648000);

      // DeepSeek V3: input 2,200 / 1M, output 8,800 / 1M
      // Cost per req = (2000 * 2200 + 500 * 8800) / 1,000,000 = (4.4 + 4.4) = 8.8 IDR
      // Monthly (30 days) = 30 * 100 * 8.8 = 26,400 IDR
      const costDeepSeek = calculateMonthlyCost(100, 2000, 500, 2200, 8800);
      expect(costDeepSeek).toBe(26400);

      // Savings
      const diff = costSonnet - costDeepSeek;
      expect(diff).toBe(621600);
      const savingsPct = Math.round((diff / costSonnet) * 100);
      expect(savingsPct).toBe(96);
    });
  });
});
