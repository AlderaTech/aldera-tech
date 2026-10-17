import {
  ArrowDown,
  ArrowRight,
  Braces,
  KeyRound,
  Network,
  Terminal,
} from "lucide-react";
import type { ModelCatalogItem } from "@/lib/ai-relay-utils";
import { RELAY_BASE_URL } from "../_data/relay-content";
import { RelayMiniMascot } from "./relay-mini-mascot";
import styles from "./relay-hero.module.css";

export function RelayConnection({ models }: { models: ModelCatalogItem[] }) {
  const availableModels = models.filter((model) => model.isActive);
  return (
    <div className={styles.connectionWrap}>
      <RelayMiniMascot pose="peek" className={styles.peek} />
      <div className={styles.connection}>
        <div className={styles.windowBar}>
          <span className={styles.windowDots} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>relay.connection</span>
          <Network className="size-4" aria-hidden="true" />
        </div>
        <div className={styles.flow}>
          <div className={styles.flowSource}>
            <span className={styles.nodeIcon}>
              <Terminal className="size-5" aria-hidden="true" />
            </span>
            <div>
              <small>WORKSPACE ANDA</small>
              <strong>Aplikasi & IDE</strong>
            </div>
            <span className={styles.protocol}>OpenAI-compatible</span>
          </div>
          <span className={styles.flowLine} aria-hidden="true">
            <ArrowDown className="size-4" />
          </span>
          <div className={styles.relayNode}>
            <span className={styles.relayIcon}>
              <Network className="size-7" aria-hidden="true" />
            </span>
            <div>
              <small>SATU AKSES TERPADU</small>
              <strong>Aldera AI Relay</strong>
            </div>
            <span className={styles.apiKey}>
              <KeyRound className="size-3.5" aria-hidden="true" />
              API Key
            </span>
          </div>
          <span className={styles.flowLine} aria-hidden="true">
            <ArrowDown className="size-4" />
          </span>
          <div className={styles.modelNodes}>
            {availableModels.slice(0, 3).map((model) => (
              <div key={model.id}>
                <Braces className="size-4" aria-hidden="true" />
                <span>{model.displayName}</span>
                <small>{model.category}</small>
              </div>
            ))}
            {availableModels.length === 0 && (
              <p>Model tersedia ditampilkan pada katalog di bawah.</p>
            )}
          </div>
        </div>
        <div className={styles.endpoint}>
          <span>BASE URL</span>
          <code>{RELAY_BASE_URL}/v1</code>
        </div>
        <a className={styles.catalogLink} href="#catalog-section">
          Jelajahi katalog model
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </div>
      <p className={styles.diagramCaption}>
        Alur integrasi · pilihan model mengikuti katalog yang tersedia.
      </p>
    </div>
  );
}
