"use client";

import { CircleAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardRefresh } from "@/components/dashboard/_hooks/use-dashboard-refresh";
import styles from "./invoices.module.css";

export function InvoicesLoadError() {
  const { refresh, isPending } = useDashboardRefresh();
  return (
    <section className={styles.errorState} role="alert">
      <CircleAlert size={25} aria-hidden="true" />
      <div>
        <h2>Invoice belum dapat dimuat</h2>
        <p>
          Data tagihan belum tersedia saat ini. Coba muat kembali untuk melihat
          invoice Anda.
        </p>
      </div>
      <Button variant="outline" onClick={refresh} disabled={isPending}>
        <RefreshCw
          className={isPending ? "animate-spin motion-reduce:animate-none" : ""}
          aria-hidden="true"
        />
        {isPending ? "Memuat..." : "Coba lagi"}
      </Button>
    </section>
  );
}
