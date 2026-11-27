import type { Metadata } from "next";
import { getModelCatalog } from "@/lib/actions/ai-relay";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { getServiceAvailability } from "@/lib/service-availability";
import { AiRelayPublicClientView } from "./client-view";

export const metadata: Metadata = {
  title: "Aldera AI Relay — Akses Model LLM Global dengan Pembayaran IDR",
  description:
    "Satu API Key terpadu untuk Claude, GPT-4o, dan DeepSeek. Bayar dengan Rupiah & QRIS tanpa kartu kredit luar negeri.",
  alternates: { canonical: PUBLIC_ROUTES.aiRelay },
};

export const dynamic = "force-dynamic";

export default async function AiRelayPublicPage() {
  const [catalog, routerEnabled] = await Promise.all([
    getModelCatalog(),
    getServiceAvailability("ai_router"),
  ]);

  return (
    <AiRelayPublicClientView
      initialCatalog={catalog}
      routerEnabled={routerEnabled}
    />
  );
}
