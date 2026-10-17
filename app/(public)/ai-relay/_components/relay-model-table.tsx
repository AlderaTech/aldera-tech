import type { ModelCatalogItem } from "@/lib/ai-relay-utils";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RelayCopyModel,
  RelayUseModel,
  type RelayModelActionsProps,
} from "./relay-model-actions";
import styles from "./relay-catalog.module.css";

export type RelayModelsProps = Omit<RelayModelActionsProps, "id"> & {
  models: ModelCatalogItem[];
};

export function RelayModelTable({ models, ...actions }: RelayModelsProps) {
  return (
    <div className={styles.tableWrap}>
      <Table className={styles.table}>
        <caption className="sr-only">
          Katalog model AI Relay dan harga Rupiah per satu juta token
        </caption>
        <TableHeader>
          <TableRow>
            <TableHead>Model & kategori</TableHead>
            <TableHead>Model ID</TableHead>
            <TableHead>Context window</TableHead>
            <TableHead>Input / 1M</TableHead>
            <TableHead>Output / 1M</TableHead>
            <TableHead>Kegunaan</TableHead>
            <TableHead>
              <span className="sr-only">Aksi</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((model) => (
            <TableRow key={model.id}>
              <TableCell>
                <strong className={styles.modelName}>
                  {model.displayName}
                </strong>
                <span className={styles.category}>{model.category}</span>
              </TableCell>
              <TableCell>
                <RelayCopyModel id={model.id} {...actions} />
              </TableCell>
              <TableCell className={styles.number}>
                {model.contextWindow.toLocaleString("id-ID")}
                <small>token</small>
              </TableCell>
              <TableCell className={styles.price}>
                {formatCurrency(model.inputPricePerM)}
              </TableCell>
              <TableCell className={styles.price}>
                {formatCurrency(model.outputPricePerM)}
              </TableCell>
              <TableCell className={styles.bestFor}>{model.bestFor}</TableCell>
              <TableCell>
                <RelayUseModel id={model.id} onUse={actions.onUse} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function RelayModelCards({ models, ...actions }: RelayModelsProps) {
  return (
    <div className={styles.modelCards}>
      {models.map((model) => (
        <article key={model.id} className={styles.modelCard}>
          <div className={styles.cardHeading}>
            <h3>{model.displayName}</h3>
            <span className={styles.category}>{model.category}</span>
          </div>
          <RelayCopyModel id={model.id} {...actions} />
          <dl className={styles.cardPrices}>
            <div>
              <dt>Input / 1M token</dt>
              <dd>{formatCurrency(model.inputPricePerM)}</dd>
            </div>
            <div>
              <dt>Output / 1M token</dt>
              <dd>{formatCurrency(model.outputPricePerM)}</dd>
            </div>
          </dl>
          <p className={styles.context}>
            Context window{" "}
            <strong>{model.contextWindow.toLocaleString("id-ID")} token</strong>
          </p>
          <p className={styles.bestFor}>{model.bestFor}</p>
          <RelayUseModel id={model.id} onUse={actions.onUse} />
        </article>
      ))}
    </div>
  );
}
