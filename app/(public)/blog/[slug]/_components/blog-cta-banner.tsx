import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PUBLIC_ROUTES } from "@/lib/routes";
import styles from "./blog-detail.module.css";

export function BlogCtaBanner() {
  return (
    <aside className={styles.cta}>
      <h2>Butuh bantuan implementasi?</h2>
      <p>
        Tim kami siap membantu mewujudkan ide dari artikel ini menjadi produk
        nyata untuk bisnis Anda.
      </p>
      <Link href={PUBLIC_ROUTES.contact} className={styles.ctaButton}>
        Konsultasi Gratis
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </aside>
  );
}
