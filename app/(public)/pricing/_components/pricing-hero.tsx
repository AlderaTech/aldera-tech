import Link from "next/link";
import {
  ArrowDown,
  Calculator,
  CalendarDays,
  Layers3,
  ListChecks,
} from "lucide-react";
import { PUBLIC_ROUTES } from "@/lib/routes";
import mascot from "@/public/images/about/aldera-cat-vision.webp";
import { StudioIllustratedHero } from "../../_components/studio-illustrated-hero";
import heroStyles from "../../_components/studio-illustrated-hero.module.css";
import shared from "../../_components/studio.module.css";

export function PricingHero() {
  return (
    <StudioIllustratedHero
      headingId="pricing-heading"
      label="Harga / Aldera Tech"
      title={
        <>
          Harga transparan, <span>tanpa kejutan.</span>
        </>
      }
      description="Pilih paket yang cocok dengan fase bisnis Anda. Semua harga sudah mencakup pajak."
      illustration={mascot}
      note="Harga final sesuai cakupan proyek."
      panelTitle="Yang memengaruhi biaya"
      panel={
        <ul className={heroStyles.panelList}>
          <li>
            <Layers3 aria-hidden="true" /> Jenis proyek
          </li>
          <li>
            <ListChecks aria-hidden="true" /> Fitur dan integrasi
          </li>
          <li>
            <CalendarDays aria-hidden="true" /> Jadwal pengerjaan
          </li>
        </ul>
      }
    >
      <a href="#pricing-plans" className={shared.blueButton}>
        Jelajahi Paket
        <ArrowDown className="size-4" aria-hidden="true" />
      </a>
      <Link href={PUBLIC_ROUTES.calculator} className={shared.outlineLink}>
        <Calculator className="size-4" aria-hidden="true" />
        Hitung Estimasi
      </Link>
    </StudioIllustratedHero>
  );
}
