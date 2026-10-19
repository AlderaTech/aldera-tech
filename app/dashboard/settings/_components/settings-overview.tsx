import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Bell,
  Info,
  Mail,
  Settings2,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import assistant from "@/public/images/dashboard/ai-relay/aldera-relay-assistant.webp";
import common from "../../projects/_components/project-list.module.css";
import styles from "./settings.module.css";

export function SettingsOverview() {
  return (
    <div className={cn(common.page, styles.page)}>
      <header className={common.header}>
        <div>
          <p className={common.eyebrow}>Workspace Anda</p>
          <h1>Pengaturan</h1>
          <p className={common.description}>
            Kelola informasi akun dan lihat ketersediaan pengaturan dashboard.
          </p>
        </div>
        <span className={styles.headerMark} aria-hidden="true">
          <Settings2 className="size-5" />
        </span>
      </header>

      <div className={styles.grid}>
        <section className={styles.panel} aria-labelledby="notifications-title">
          <header className={styles.panelHeader}>
            <span className={styles.icon} aria-hidden="true">
              <Bell className="size-5" />
            </span>
            <div className={styles.panelHeading}>
              <h2 id="notifications-title">Notifikasi</h2>
              <p>Preferensi pembaruan melalui email.</p>
            </div>
            <span className={styles.status}>Belum tersedia</span>
          </header>

          <div className={styles.notificationBody}>
            <div className={styles.notificationCopy}>
              <span className={styles.mailIcon} aria-hidden="true">
                <Mail className="size-5" />
              </span>
              <h3>Notifikasi email</h3>
              <p>Pengaturan notifikasi email akan hadir sebentar lagi.</p>
            </div>
            <div className={styles.mascot} aria-hidden="true">
              <Image
                src={assistant}
                alt=""
                fill
                sizes="112px"
                className="object-contain"
              />
            </div>
          </div>

          <div className={styles.notice}>
            <Info className="size-4 shrink-0" aria-hidden="true" />
            <p>
              Belum ada preferensi notifikasi yang dapat diubah di halaman ini.
            </p>
          </div>
        </section>

        <section
          className={cn(styles.panel, styles.profilePanel)}
          aria-labelledby="account-title"
        >
          <span className={styles.icon} aria-hidden="true">
            <UserRound className="size-5" />
          </span>
          <p className={styles.eyebrow}>Informasi akun</p>
          <h2 id="account-title">Informasi pribadi</h2>
          <p className={styles.profileDescription}>
            Perbarui nama lengkap dan nomor telepon Anda melalui halaman Profil.
          </p>
          <Button
            asChild
            className={cn(common.primaryButton, styles.profileLink)}
          >
            <Link href={DASHBOARD_ROUTES.profile}>
              Kelola Profil
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
