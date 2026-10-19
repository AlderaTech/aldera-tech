import type { ReactNode } from "react";
import { UserRoundCog } from "lucide-react";
import { cn } from "@/lib/utils";
import common from "../../projects/_components/project-list.module.css";
import styles from "./profile.module.css";

export function ProfileFrame({ children }: { children: ReactNode }) {
  return (
    <div className={cn(common.page, styles.page)}>
      <header className={common.header}>
        <div>
          <p className={common.eyebrow}>Akun &amp; identitas</p>
          <h1>Profil Saya</h1>
          <p className={common.description}>
            Kelola informasi pribadi dan kontak untuk akun Aldera Tech Anda.
          </p>
        </div>
        <span className={styles.headerIcon} aria-hidden="true">
          <UserRoundCog size={23} />
        </span>
      </header>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
