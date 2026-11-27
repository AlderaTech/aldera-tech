import { queryRouter } from "@/lib/router-db";

export type RelayService = "ai_router" | "telegram_bot";

export async function getServiceAvailability(service: RelayService) {
  const { rows } = await queryRouter<{ enabled: boolean }>(
    "SELECT enabled FROM service_availability WHERE service = $1",
    [service]
  );
  if (!rows[0]) throw new Error(`Missing availability setting for ${service}`);
  return rows[0].enabled;
}
