import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import mascot from "@/public/images/dashboard/ai-relay/aldera-relay-assistant.webp";
import { EmptyStatePattern } from "../../_components/empty-state-pattern";
import styles from "./invoices.module.css";

export function InvoicesEmptyState({
  status,
  hasMoreInvoices = false,
}: {
  status?: string;
  hasMoreInvoices?: boolean;
} = {}) {
  const filtered = !!status;
  const title = hasMoreInvoices
    ? "Halaman ini belum berisi invoice"
    : filtered
      ? "Tidak ada invoice dengan status ini"
      : "Belum ada invoice";
  const description = hasMoreInvoices
    ? "Kembali ke halaman pertama untuk melihat daftar invoice yang tersedia."
    : filtered
      ? "Coba pilihan status lain atau tampilkan seluruh invoice Anda."
      : "Invoice yang diterbitkan untuk akun Anda akan muncul di sini. Anda dapat memantau proyek terlebih dahulu.";
  const href = hasMoreInvoices
    ? DASHBOARD_ROUTES.invoicesWithParams({ status })
    : filtered
      ? DASHBOARD_ROUTES.invoices
      : DASHBOARD_ROUTES.projects;
  const action = hasMoreInvoices
    ? "Ke halaman pertama"
    : filtered
      ? "Tampilkan semua invoice"
      : "Lihat Proyek Saya";
  return (
    <div className={styles.emptyState}>
      <EmptyStatePattern className={styles.emptyPattern} />
      <Image
        src={mascot}
        width={120}
        height={120}
        sizes="(max-width: 479px) 104px, 120px"
        className={styles.emptyMascot}
        alt=""
        aria-hidden="true"
      />
      <div className={styles.emptyCopy}>
        <p className={styles.stateEyebrow}>Invoice Anda</p>
        <h3>{title}</h3>
        <p>{description}</p>
        <Link href={href}>
          {action} <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
