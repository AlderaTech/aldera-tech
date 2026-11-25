"use client";

import { Suspense } from "react";
import { RelayPauseCard } from "@/components/ai-relay/relay-pause-card";
import type { ModelCatalogItem } from "@/lib/ai-relay-utils";
import { useRelayShowcase } from "./_hooks/use-relay-showcase";
import { RelayHero } from "./_components/relay-hero";
import { RelayCatalog } from "./_components/relay-catalog";
import { RelayQuickstart } from "./_components/relay-quickstart";
import { RelaySimulator } from "./_components/relay-simulator";
import { RelayCta } from "./_components/relay-cta";
import shared from "../_components/studio.module.css";
import styles from "./_components/relay.module.css";

interface RelayPublicProps {
  initialCatalog: ModelCatalogItem[];
  routerEnabled: boolean;
}

function AiRelayPublicContent({
  initialCatalog,
  routerEnabled,
}: RelayPublicProps) {
  const state = useRelayShowcase(initialCatalog);
  return (
    <div className={styles.page}>
      {routerEnabled ? (
        <RelayHero models={initialCatalog} />
      ) : (
        <div className={styles.section}>
          <div className={shared.container}>
            <RelayPauseCard view="public" />
          </div>
        </div>
      )}
      <RelayCatalog state={state} routerEnabled={routerEnabled} />
      {routerEnabled && (
        <RelayQuickstart models={initialCatalog} state={state} />
      )}
      <RelaySimulator models={initialCatalog} state={state} />
      {routerEnabled && <RelayCta />}
    </div>
  );
}

export function AiRelayPublicClientView(props: RelayPublicProps) {
  return (
    <Suspense fallback={null}>
      <AiRelayPublicContent {...props} />
    </Suspense>
  );
}
