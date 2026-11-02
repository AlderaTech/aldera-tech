import type { ReactNode } from "react";
import styles from "./profile.module.css";
import { UserRound } from "lucide-react";

export function ProfileFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page} data-profile-page>
      <header className={styles.header} aria-labelledby="profile-heading">
        <p className={styles.eyebrow}>
          <UserRound size={14} aria-hidden="true" /> Akun &amp; identitas
        </p>
        <h1 id="profile-heading">Profil Saya</h1>
        <p className={styles.description}>
          Kelola informasi pribadi dan kontak untuk akun Aldera Tech Anda.
        </p>
      </header>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
