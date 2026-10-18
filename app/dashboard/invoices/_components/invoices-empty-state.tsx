import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import styles from "./invoices.module.css";

export function InvoicesEmptyState() {
  return (
    <div className={styles.emptyState}>
      <Image
        src="/images/dashboard/ai-relay/aldera-relay-assistant.webp"
        width={100}
        height={100}
        sizes="100px"
        alt=""
        aria-hidden="true"
      />
      <div>
        <p className={styles.stateEyebrow}>Invoice Anda</p>
        <h3>Belum ada invoice</h3>
        <p>
          Invoice yang diterbitkan untuk akun Anda akan muncul di sini. Anda
          dapat memantau proyek terlebih dahulu.
        </p>
        <Link href={DASHBOARD_ROUTES.projects}>
          Lihat Proyek Saya <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
