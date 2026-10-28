import type { ReactNode } from "react";
import styles from "./profile.module.css";

export function ProfileFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page} data-profile-page>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Akun &amp; identitas</p>
        <h1>Profil Saya</h1>
        <p className={styles.description}>
          Kelola informasi pribadi dan kontak untuk akun Aldera Tech Anda.
        </p>
      </header>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
