import Link from "next/link";
import { ArrowUpRight, Calculator, Check, Minus } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/shared/motion";
import type { PublicPricingPlan } from "@/lib/public-settings";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import shared from "../../_components/studio.module.css";
import { PricingPlanCard } from "./pricing-plan-card";
import base from "./pricing.module.css";
import styles from "./pricing-plans.module.css";

export function PricingGrid({ plans }: { plans: PublicPricingPlan[] }) {
  return (
    <section
      id="pricing-plans"
      className={styles.section}
      aria-labelledby="plans-heading"
    >
      <div className={shared.container}>
        <div className={base.sectionHeading}>
          <div>
            <p className={base.eyebrow}>
              <span aria-hidden="true">01</span>Pilihan paket
            </p>
            <h2 id="plans-heading">
              Investasi sesuai
              <br />
              fase bisnis Anda.
            </h2>
          </div>
          <p className={base.sectionDescription}>
            Bandingkan cakupan setiap paket, lalu pilih titik awal yang paling
            sesuai dengan kebutuhan produk digital Anda.
          </p>
        </div>
        <StaggerContainer className={styles.grid}>
          {plans.map((plan, index) => (
            <StaggerItem key={plan.slug} className={styles.gridItem}>
              <PricingPlanCard plan={plan} index={index} />
            </StaggerItem>
          ))}
        </StaggerContainer>
        <div className={styles.planNotes}>
          <div className={styles.legend}>
            <span>
              <Check className="size-3.5" aria-hidden="true" />
              Termasuk
            </span>
            <span>
              <Minus className="size-3.5" aria-hidden="true" />
              Tidak termasuk
            </span>
          </div>
          <p>
            Harga mulai. Harga final mengikuti rincian cakupan setelah sesi
            discovery.
          </p>
        </div>
        <div className={styles.estimateHelp}>
          <span className={styles.helpIcon}>
            <Calculator
              className="size-6"
              aria-hidden="true"
              strokeWidth={1.6}
            />
          </span>
          <div>
            <h3>Butuh estimasi lebih detail?</h3>
            <p>
              Gunakan kalkulator harga kami untuk menghitung biaya berdasarkan
              fitur spesifik yang Anda butuhkan.
            </p>
          </div>
          <Link
            href={PUBLIC_ROUTES.calculator}
            className={cn(shared.outlineLink, styles.helpLink)}
          >
            Hitung Estimasi Detail
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
