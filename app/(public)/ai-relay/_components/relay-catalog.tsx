import { Layers, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import shared from "../../_components/studio.module.css";
import { CATEGORY_TABS } from "../_data/relay-content";
import type { RelayShowcaseState } from "../_hooks/use-relay-showcase";
import { RelaySectionHeading } from "./relay-section-heading";
import { RelayModelCards, RelayModelTable } from "./relay-model-table";
import base from "./relay.module.css";
import styles from "./relay-catalog.module.css";

export function RelayCatalog({ state }: { state: RelayShowcaseState }) {
  const actions = {
    models: state.activeModels,
    copiedId: state.copiedId,
    onCopy: state.handleCopyModelId,
    onUse: state.handleSelectModelForQuickstart,
  };
  return (
    <section
      id="catalog-section"
      className={base.section}
      aria-labelledby="catalog-heading"
    >
      <div className={shared.container}>
        <RelaySectionHeading
          id="catalog-heading"
          index="01"
          eyebrow="Transparansi penuh"
          title="Model yang tepat. Biaya yang jelas."
        >
          Katalog model & harga IDR per 1M token. Tanpa langganan bulanan
          minimum, saldo hanya terpotong sesuai pemakaian riil.
        </RelaySectionHeading>
        <div className={styles.catalogPanel}>
          <div className={styles.toolbar}>
            <div
              className={styles.filters}
              role="group"
              aria-label="Kategori model"
            >
              {CATEGORY_TABS.map((tab) => (
                <Button
                  key={tab.value}
                  variant="ghost"
                  size="sm"
                  type="button"
                  aria-pressed={state.selectedCategory === tab.value}
                  onClick={() => state.setSelectedCategory(tab.value)}
                  className={cn(
                    styles.filter,
                    state.selectedCategory === tab.value && styles.selected
                  )}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
            <div className={styles.search}>
              <Search className="size-4" aria-hidden="true" />
              <label htmlFor="relay-model-search" className="sr-only">
                Cari model, ID, atau kegunaan
              </label>
              <Input
                id="relay-model-search"
                type="search"
                placeholder="Cari model, ID, atau kegunaan..."
                value={state.searchQuery}
                onChange={(e) => state.setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.catalogMeta}>
            <p role="status" aria-live="polite">
              {state.activeModels.length} model ditampilkan
            </p>
            <span>Harga dalam Rupiah / 1 juta token</span>
          </div>
          {state.activeModels.length === 0 ? (
            <div className={styles.empty}>
              <Layers className="size-7" aria-hidden="true" />
              <h3>Tidak ada model yang cocok</h3>
              <p>
                Coba sesuaikan kata kunci pencarian atau ganti filter kategori.
              </p>
            </div>
          ) : (
            <>
              <RelayModelTable {...actions} />
              <RelayModelCards {...actions} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
