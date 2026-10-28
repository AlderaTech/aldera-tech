import { Network, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { RelayMascot } from "./relay-mascot";
import styles from "./relay-workspace.module.css";

export function RelayHeader({
  balance,
  onTopup,
}: {
  balance: number;
  onTopup: () => void;
}) {
  return (
    <header className={styles.header} aria-labelledby="relay-heading">
      <div className={styles.welcome}>
        <div>
          <p className={styles.eyebrow}>
            <Network aria-hidden="true" /> Workspace AI Anda
          </p>
          <h1 id="relay-heading">Aldera AI API Relay</h1>
          <p className={styles.description}>
            Akses katalog model AI, hubungkan IDE, dan kelola pemakaian dengan
            saldo Rupiah.
          </p>
        </div>
        <RelayMascot pose="connect" className={styles.welcomeMascot} />
      </div>
      <div className={styles.balancePanel} data-relay-balance-panel>
        <div>
          <span className={styles.balanceLabel}>
            <Wallet aria-hidden="true" /> Saldo Aktif
          </span>
          <strong data-relay-balance>{formatCurrency(balance)}</strong>
        </div>
        <Button onClick={onTopup}>
          <Wallet className="size-4" aria-hidden="true" /> Top-up Saldo
        </Button>
      </div>
    </header>
  );
}
