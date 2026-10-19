"use client";

import { Suspense } from "react";
import type { ModelCatalogItem } from "@/lib/ai-relay-utils";
import { useRelayShowcase } from "./_hooks/use-relay-showcase";
import { RelayHero } from "./_components/relay-hero";
import { RelayCatalog } from "./_components/relay-catalog";
import { RelayQuickstart } from "./_components/relay-quickstart";
import { RelaySimulator } from "./_components/relay-simulator";
import { RelayCta } from "./_components/relay-cta";
import styles from "./_components/relay.module.css";

function AiRelayPublicContent({
  initialCatalog,
}: {
  initialCatalog: ModelCatalogItem[];
}) {
  const state = useRelayShowcase(initialCatalog);
  return (
    <div className={styles.page}>
      <RelayHero models={initialCatalog} />
      <RelayCatalog state={state} />
      <RelayQuickstart models={initialCatalog} state={state} />
      <RelaySimulator models={initialCatalog} state={state} />
      <RelayCta />
    </div>
  );
}

export function AiRelayPublicClientView(props: {
  initialCatalog: ModelCatalogItem[];
}) {
  return (
    <Suspense fallback={null}>
      <AiRelayPublicContent {...props} />
    </Suspense>
  );
}
