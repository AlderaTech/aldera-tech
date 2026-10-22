import Image from "next/image";
import mascot from "@/public/images/services/aldera-cat-services.webp";
import { cn } from "@/lib/utils";
import commonStyles from "../../projects/_components/project-list.module.css";
import { EmptyStatePattern } from "../../_components/empty-state-pattern";

export function OrdersEmptyState() {
  return (
    <section
      className={cn(commonStyles.statePanel, commonStyles.emptyPanel)}
      aria-labelledby="orders-empty-heading"
    >
      <Image
        src={mascot}
        alt=""
        width={140}
        height={140}
        aria-hidden="true"
        className={commonStyles.mascot}
        sizes="(min-width: 640px) 140px, 112px"
        quality={90}
      />
      <div className={commonStyles.stateContent}>
        <p className={commonStyles.eyebrow}>Rencanakan langkah Anda</p>
        <h2 id="orders-empty-heading">Belum ada estimasi</h2>
        <p>Gunakan kalkulator harga untuk menghitung estimasi proyek Anda.</p>
      </div>
      <EmptyStatePattern />
    </section>
  );
}
