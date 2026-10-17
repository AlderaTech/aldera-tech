import { KeyRound, QrCode, Settings2, Terminal } from "lucide-react";
import type { ModelCatalogItem } from "@/lib/ai-relay-utils";
import { cn } from "@/lib/utils";
import shared from "../../_components/studio.module.css";
import { IDE_TARGETS } from "../_data/relay-content";
import type { RelayShowcaseState } from "../_hooks/use-relay-showcase";
import { RelayCodeWindow } from "./relay-code-window";
import { RelayMiniMascot } from "./relay-mini-mascot";
import { RelayModelSelect } from "./relay-model-select";
import { RelaySectionHeading } from "./relay-section-heading";
import base from "./relay.module.css";
import styles from "./relay-tools.module.css";

const STEPS = [
  {
    icon: KeyRound,
    title: "Buat akun & API Key",
    description:
      "Daftar akun gratis, lalu buat token API unik berformat sk-toko-... melalui dashboard AI Relay.",
  },
  {
    icon: QrCode,
    title: "Top up saldo via QRIS",
    description:
      "Scan QRIS dari m-banking atau e-wallet Anda. Saldo masuk otomatis tanpa kartu kredit luar negeri.",
  },
  {
    icon: Settings2,
    title: "Konfigurasi IDE Anda",
    description:
      "Pilih tool dan model, salin konfigurasi, lalu tempel ke pengaturan editor Anda.",
  },
];

export function RelayQuickstart({
  models,
  state,
}: {
  models: ModelCatalogItem[];
  state: RelayShowcaseState;
}) {
  return (
    <section
      id="quickstart-guide"
      className={cn(base.section, base.softSection)}
      aria-labelledby="quickstart-heading"
    >
      <div className={shared.container}>
        <RelaySectionHeading
          id="quickstart-heading"
          index="02"
          eyebrow="Integrasi developer"
          title="Dari API Key ke workspace Anda."
          variant="center"
        >
          Tiga langkah mulai coding. Endpoint kompatibel OpenAI, dengan snippet
          konfigurasi sesuai IDE dan model pilihan Anda.
        </RelaySectionHeading>
        <ol className={styles.steps}>
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <li key={title}>
              <div className={styles.stepTop}>
                <span>
                  <Icon
                    className="size-5"
                    aria-hidden="true"
                    strokeWidth={1.6}
                  />
                </span>
                <small aria-hidden="true">0{index + 1}</small>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
        <div className={styles.config}>
          <div className={styles.configSidebar}>
            <p className={styles.toolLabel}>
              <Terminal className="size-4" aria-hidden="true" />
              Pilih tool Anda
            </p>
            <div
              className={styles.ideTabs}
              role="group"
              aria-label="Target konfigurasi IDE"
            >
              {IDE_TARGETS.map((ide) => (
                <button
                  key={ide.id}
                  type="button"
                  aria-pressed={state.selectedIde === ide.id}
                  onClick={() => state.setSelectedIde(ide.id)}
                  className={cn(
                    styles.ideTab,
                    state.selectedIde === ide.id && styles.activeIde
                  )}
                >
                  <Terminal className="size-4" aria-hidden="true" />
                  {ide.name}
                </button>
              ))}
            </div>
            <RelayMiniMascot pose="connect" className={styles.connectMascot} />
          </div>
          <div className={styles.configMain}>
            <div className={styles.configHeader}>
              <div>
                <span className={styles.configBadge}>IDE PRESET</span>
                <h3>Snippet konfigurasi siap pakai</h3>
                <p>Gunakan API Key milik Anda pada konfigurasi ini.</p>
              </div>
              <RelayModelSelect
                id="quickstart-model"
                label="Model untuk konfigurasi"
                models={models}
                value={state.quickstartModelId}
                onValueChange={state.setQuickstartModelId}
              />
            </div>
            <RelayCodeWindow
              code={state.generatedIdeConfig}
              ideName={
                IDE_TARGETS.find((ide) => ide.id === state.selectedIde)?.name ??
                "IDE"
              }
              ideId={state.selectedIde}
              copied={state.copiedConfig}
              onCopy={state.handleCopyConfig}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
