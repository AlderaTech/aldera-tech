import { RELAY_ORIGINS, SITE_ORIGINS } from "./routes";

export function isProductionSite(
  appUrl = process.env.NEXT_PUBLIC_APP_URL
): boolean {
  if (!appUrl) return false;
  try {
    const url = new URL(appUrl);
    const production = new URL(SITE_ORIGINS.production);
    return (
      url.protocol === "https:" &&
      (url.hostname === production.hostname ||
        url.hostname === `www.${production.hostname}`)
    );
  } catch {
    return false;
  }
}

export function getRelayApiBaseUrl(
  appUrl = process.env.NEXT_PUBLIC_APP_URL
): string {
  return isProductionSite(appUrl)
    ? RELAY_ORIGINS.production
    : RELAY_ORIGINS.staging;
}
