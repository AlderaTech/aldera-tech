import { SlidersHorizontal, TrendingDown } from "lucide-react";
import type { ModelCatalogItem } from "@/lib/ai-relay-utils";
import { formatCurrency } from "@/lib/utils";
import shared from "../../_components/studio.module.css";
import type { RelayShowcaseState } from "../_hooks/use-relay-showcase";
import { RelayModelSelect } from "./relay-model-select";
import { RelayRangeField } from "./relay-range-field";
import { RelaySectionHeading } from "./relay-section-heading";
import base from "./relay.module.css";
import styles from "./relay-tools.module.css";

export function RelaySimulator({
  models,
  state,
}: {
  models: ModelCatalogItem[];
  state: RelayShowcaseState;
}) {
  const choices = [
    {
      id: "sim-model-a",
      label: "Model Pilihan A",
      value: state.simModelAId,
      onValueChange: state.setSimModelAId,
      cost: state.costA,
    },
    {
      id: "sim-model-b",
      label: "Model Pilihan B",
      value: state.simModelBId,
      onValueChange: state.setSimModelBId,
      cost: state.costB,
    },
  ];
  return (
    <section className={base.section} aria-labelledby="simulator-heading">
      <div className={shared.container}>
        <RelaySectionHeading
          id="simulator-heading"
          index="03"
          eyebrow="Kalkulator biaya"
          title="Rencanakan pemakaian. Bandingkan anggaran."
          variant="indexed"
        >
          Simulasi & perbandingan pengeluaran AI bulanan berdasarkan model
          pilihan dan perkiraan beban kerja harian Anda.
        </RelaySectionHeading>
        <div className={styles.simulatorGrid}>
          <div className={styles.parameters}>
            <h3>
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Parameter beban kerja harian
            </h3>
            <RelayRangeField
              id="relay-daily-requests"
              label="Jumlah request / hari"
              value={state.dailyRequests}
              onChange={state.setDailyRequests}
              unit="req"
              min={10}
              max={3000}
              step={10}
              midpoint="1.500"
            />
            <RelayRangeField
              id="relay-prompt-tokens"
              label="Rata-rata token prompt"
              value={state.avgPromptTokens}
              onChange={state.setAvgPromptTokens}
              unit="token"
              min={200}
              max={8000}
              step={100}
              midpoint="4.000"
            />
            <RelayRangeField
              id="relay-completion-tokens"
              label="Rata-rata token completion"
              value={state.avgCompletionTokens}
              onChange={state.setAvgCompletionTokens}
              unit="token"
              min={50}
              max={3000}
              step={50}
              midpoint="1.500"
            />
          </div>
          <div className={styles.results}>
            <div className={styles.costCards}>
              {choices.map(({ id, label, value, onValueChange, cost }) => (
                <article key={id} className={styles.costCard}>
                  <RelayModelSelect
                    id={id}
                    label={label}
                    value={value}
                    onValueChange={onValueChange}
                    models={models}
                  />
                  <div className={styles.cost}>
                    <span>Estimasi biaya / bulan</span>
                    <strong>{formatCurrency(cost)}</strong>
                    <p>
                      Untuk {(state.dailyRequests * 30).toLocaleString("id-ID")}{" "}
                      panggilan per bulan
                    </p>
                  </div>
                </article>
              ))}
            </div>
            {state.costDiff > 0 && (
              <div className={styles.savings}>
                <span>
                  <TrendingDown className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3>
                    Penghematan potensial{" "}
                    <strong>
                      {formatCurrency(state.costDiff)} / bulan (
                      {state.savingsPercent}%)
                    </strong>
                  </h3>
                  <p>
                    Memilih <b>{state.lowerModel}</b> dibanding{" "}
                    <b>{state.higherModel}</b> dapat menekan pengeluaran AI
                    hingga {state.savingsPercent}% untuk beban volume yang sama.
                  </p>
                </div>
              </div>
            )}
            <p className={styles.estimateNote}>
              Estimasi memakai harga katalog dan 30 hari pemakaian. Biaya aktual
              mengikuti jumlah token yang digunakan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
