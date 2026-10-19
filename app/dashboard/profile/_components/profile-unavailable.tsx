"use client";

import { CircleAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardRefresh } from "@/components/dashboard/_hooks/use-dashboard-refresh";
import styles from "./profile.module.css";

export function ProfileUnavailable() {
  const { refresh, isPending } = useDashboardRefresh();
  return (
    <section className={styles.unavailable} role="alert">
      <span>
        <CircleAlert size={25} aria-hidden="true" />
      </span>
      <div>
        <h2>Profil belum dapat dimuat</h2>
        <p>
          Coba muat kembali untuk melihat dan memperbarui informasi akun Anda.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={refresh}
        disabled={isPending}
      >
        <RefreshCw
          size={16}
          className={isPending ? "animate-spin motion-reduce:animate-none" : ""}
          aria-hidden="true"
        />
        {isPending ? "Memuat..." : "Coba lagi"}
      </Button>
    </section>
  );
}
