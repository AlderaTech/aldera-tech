import { describe, expect, it } from "bun:test";
import { getRelayApiBaseUrl, isProductionSite } from "./deployment-environment";
import { RELAY_ORIGINS, SITE_ORIGINS } from "./routes";

describe("Deployment isolation", () => {
  it("uses the correct public relay endpoint without sending staging clients to production", () => {
    expect(getRelayApiBaseUrl(SITE_ORIGINS.production)).toBe(
      RELAY_ORIGINS.production
    );
    expect(getRelayApiBaseUrl(SITE_ORIGINS.staging)).toBe(
      RELAY_ORIGINS.staging
    );
    expect(getRelayApiBaseUrl("http://localhost:3000")).toBe(
      RELAY_ORIGINS.staging
    );
  });
  it("indexes only the HTTPS production domain", () => {
    expect(isProductionSite(SITE_ORIGINS.production)).toBe(true);
    expect(isProductionSite("https://www.aldera.tech")).toBe(true);
    for (const value of [
      SITE_ORIGINS.staging,
      "http://aldera.tech",
      "invalid",
      "https://aldera.tech.attacker.test",
      "http://localhost:3000",
    ])
      expect(isProductionSite(value)).toBe(false);
  });
});
