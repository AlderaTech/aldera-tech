import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Bell,
  Info,
  Mail,
  Phone,
  Settings2,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import assistant from "@/public/images/dashboard/ai-relay/aldera-relay-assistant.webp";
import styles from "./settings.module.css";

export function SettingsOverview() {
  return (
    <div className={styles.page} data-settings-page>
      <header className={styles.header}>
        <div className={styles.headingGroup}>
          <span className={styles.headerMark} aria-hidden="true">
            <Settings2 className="size-6" />
          </span>
          <div>
            <p className={styles.eyebrow}>Akun & preferensi</p>
            <h1>Pengaturan</h1>
          </div>
        </div>
        <p className={styles.description}>
          Kelola informasi akun dan lihat ketersediaan pengaturan dashboard.
        </p>
      </header>

      <div className={styles.grid}>
        <section
          className={cn(styles.panel, styles.profilePanel)}
          aria-labelledby="account-title"
        >
          <header className={styles.panelHeader}>
            <span className={styles.icon} aria-hidden="true">
              <UserRound className="size-5" />
            </span>
            <div className={styles.panelHeading}>
              <p className={styles.eyebrow}>Informasi akun</p>
              <h2 id="account-title">Informasi pribadi</h2>
            </div>
          </header>
          <div className={styles.profileBody}>
            <p className={styles.profileDescription}>
              Perbarui nama lengkap dan nomor telepon Anda melalui halaman
              Profil.
            </p>
            <ul
              className={styles.profileFields}
              aria-label="Informasi yang dapat dikelola di Profil"
            >
              <li>
                <UserRound className="size-4" aria-hidden="true" />
                <div>
                  <h3>Nama lengkap</h3>
                  <p>Nama yang digunakan pada akun Anda.</p>
                </div>
              </li>
              <li>
                <Phone className="size-4" aria-hidden="true" />
                <div>
                  <h3>Nomor telepon</h3>
                  <p>Kontak untuk berkomunikasi dengan tim.</p>
                </div>
              </li>
            </ul>
          </div>
          <footer className={styles.panelFooter}>
            <Button asChild className={styles.profileLink}>
              <Link href={DASHBOARD_ROUTES.profile}>
                Kelola Profil
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </footer>
        </section>

        <section
          className={cn(styles.panel, styles.notificationsPanel)}
          aria-labelledby="notifications-title"
        >
          <header className={styles.panelHeader}>
            <span
              className={cn(styles.icon, styles.notificationIcon)}
              aria-hidden="true"
            >
              <Bell className="size-5" />
            </span>
            <div className={styles.panelHeading}>
              <p className={styles.eyebrow}>Preferensi pesan</p>
              <h2 id="notifications-title">Notifikasi</h2>
            </div>
            <span className={styles.status}>
              <span aria-hidden="true" /> Belum tersedia
            </span>
          </header>

          <div className={styles.notificationBody}>
            <div className={styles.notificationCopy}>
              <h3>Notifikasi email</h3>
              <p className={styles.notificationSubtitle}>
                Preferensi pembaruan melalui email.
              </p>
              <p>Pengaturan notifikasi email akan hadir sebentar lagi.</p>
            </div>
            <div className={styles.mascotStage} aria-hidden="true">
              <div className={styles.mascot}>
                <Image
                  src={assistant}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-contain"
                />
              </div>
              <span className={styles.mailIcon}>
                <Mail className="size-4" />
              </span>
            </div>
          </div>

          <div className={styles.notice}>
            <Info className="size-4 shrink-0" aria-hidden="true" />
            <p>
              Belum ada preferensi notifikasi yang dapat diubah di halaman ini.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
