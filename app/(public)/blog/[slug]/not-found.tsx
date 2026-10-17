import Link from "next/link";
import { ArrowLeft, BookOpenText } from "lucide-react";
import { PUBLIC_ROUTES } from "@/lib/routes";
import shared from "../../_components/studio.module.css";
import styles from "./_components/blog-detail.module.css";

export default function BlogDetailNotFound() {
  return (
    <div className={styles.notFound}>
      <div className={shared.container}>
        <div className={styles.notFoundInner}>
          <BookOpenText className="size-10" aria-hidden="true" />
          <h1>Artikel tidak ditemukan</h1>
          <p>
            Artikel yang Anda cari belum tersedia. Jelajahi tulisan lain dari
            tim Aldera Tech.
          </p>
          <Link href={PUBLIC_ROUTES.blog}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Kembali ke Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
