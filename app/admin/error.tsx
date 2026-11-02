"use client";

import { Button } from "@/components/ui/button";
import { AdminEmptyState } from "./_components/admin-empty-state";
import styles from "./_components/admin-common.module.css";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className={styles.error} role="alert">
      <AdminEmptyState
        label="STATUS HALAMAN"
        title="Halaman belum dapat dimuat"
        description="Terjadi kendala saat memuat halaman admin. Coba muat ulang untuk melanjutkan."
        action={<Button onClick={reset}>Coba lagi</Button>}
      />
    </section>
  );
}
