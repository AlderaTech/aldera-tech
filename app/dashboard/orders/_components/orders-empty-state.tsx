import Image from "next/image";
import mascot from "@/public/images/services/aldera-cat-services.webp";
import commonStyles from "../../projects/_components/project-list.module.css";

export function OrdersEmptyState() {
  return (
    <section
      className={commonStyles.statePanel}
      aria-labelledby="orders-empty-heading"
    >
      <div className={commonStyles.stateContent}>
        <p className={commonStyles.eyebrow}>Rencanakan langkah Anda</p>
        <h2 id="orders-empty-heading">Belum ada estimasi</h2>
        <p>Gunakan kalkulator harga untuk menghitung estimasi proyek Anda.</p>
      </div>
      <Image
        src={mascot}
        alt=""
        aria-hidden="true"
        className={commonStyles.mascot}
        sizes="(min-width: 640px) 128px, 96px"
        quality={90}
      />
    </section>
  );
}
