import Link from "next/link";
import { ArrowUpRight, Braces } from "lucide-react";
import { AUTH_ROUTES } from "@/lib/routes";
import shared from "../../_components/studio.module.css";
import styles from "./relay.module.css";

export function RelayCta() {
  return (
    <section className={styles.ctaSection} aria-labelledby="relay-cta-heading">
      <div className={shared.container}>
        <div className={styles.cta}>
          <div className={styles.ctaCopy}>
            <p className={styles.eyebrow}>
              <Braces className="size-4" aria-hidden="true" />
              Langkah berikutnya
            </p>
            <h2 id="relay-cta-heading">
              Siap mengakselerasi
              <br />
              <span>workflow coding & AI Anda?</span>
            </h2>
            <p>
              Akses model AI global melalui Aldera AI Relay. Mulai dari akun
              Anda, hubungkan IDE, dan kelola pemakaian dalam Rupiah.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Link href={AUTH_ROUTES.register} className={shared.blueButton}>
              Daftar Sekarang — Akses Instan
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href={AUTH_ROUTES.login} className={shared.outlineLink}>
              Sudah Punya Akun? Masuk
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
