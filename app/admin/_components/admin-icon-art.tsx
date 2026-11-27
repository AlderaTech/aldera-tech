import Image from "next/image";
import { cn } from "@/lib/utils";
import styles from "./admin-common.module.css";

export const ADMIN_ICON_ARTWORKS = {
  "tech-web": "/images/about/technology/web.webp",
  "tech-backend": "/images/about/technology/backend.webp",
  "tech-mobile": "/images/about/technology/mobile.webp",
  "tech-cloud": "/images/about/technology/cloud.webp",
  "tech-design": "/images/about/technology/design.webp",
  "tech-ai": "/images/about/technology/ai.webp",
  "service-web": "/images/services/cards/web.webp",
  "service-mobile": "/images/services/cards/mobile.webp",
  "service-design": "/images/services/cards/design.webp",
  "service-commerce": "/images/services/cards/commerce.webp",
  "service-seo": "/images/services/cards/seo.webp",
  "service-consulting": "/images/services/cards/consulting.webp",
  "service-cloud": "/images/services/cards/cloud.webp",
  "service-ai": "/images/services/cards/ai.webp",
  "service-quality": "/images/services/cards/quality.webp",
} as const;

export const ADMIN_ICON_ART_SIZES = {
  stat: {
    width: 52,
    height: 52,
    sizes: "52px",
  },
  item: {
    width: 56,
    height: 56,
    sizes: "56px",
  },
  sm: {
    width: 44,
    height: 44,
    sizes: "44px",
  },
} as const;

export type AdminIconArtworkKey = keyof typeof ADMIN_ICON_ARTWORKS;
export type AdminIconArtSize = keyof typeof ADMIN_ICON_ART_SIZES;

export function resolveAdminIconArtwork(hint: string): AdminIconArtworkKey {
  const key = hint.toLowerCase();

  if (/(mobile|android|ios|smartphone)/.test(key)) {
    return "service-mobile";
  }
  if (/(proyek aktif|active project)/.test(key)) {
    return "tech-mobile";
  }
  if (
    /(commerce|e-commerce|toko|shop|cart|order|pesanan|payment|bayar|checkout|split|invoice|tagihan|billable)/.test(
      key
    )
  ) {
    return "service-commerce";
  }
  if (
    /(revenue|pendapatan|profit|ltv|seo|rating|peringkat|koleksi|collection)/.test(
      key
    )
  ) {
    return "service-seo";
  }
  if (
    /(ai|llm|machine learning|neural|fitur|major|smart|bot|otomatis)/.test(key)
  ) {
    return "tech-ai";
  }
  if (/(add-on|retainer|cloud|devops|server|hosting|deploy|kurasi)/.test(key)) {
    return "tech-cloud";
  }
  if (
    /(maintenance|sla|quality|garansi|publik|delivery aktif|verifikasi|auth|login|security|shield|selesai)/.test(
      key
    )
  ) {
    return "service-quality";
  }
  if (/(design|ui|ux|studi kasus|portfolio|draft|kreatif|branding)/.test(key)) {
    return "tech-design";
  }
  if (
    /(industri|sektor|formula|pengaturan|database|backend|file|sistem|jam|timesheet|durasi)/.test(
      key
    )
  ) {
    return "tech-backend";
  }
  if (/(testimoni|ulasan|proposal|konsultasi|klien|anggota|tim)/.test(key)) {
    return "service-consulting";
  }
  if (/(web|saas|company profile|landing)/.test(key)) {
    return "service-web";
  }

  return "tech-web";
}

export function AdminIconArt({
  artwork,
  hint = "",
  size = "stat",
  className,
}: {
  artwork?: AdminIconArtworkKey;
  hint?: string;
  size?: AdminIconArtSize;
  className?: string;
}) {
  const resolvedKey = artwork ?? resolveAdminIconArtwork(hint);
  const src = ADMIN_ICON_ARTWORKS[resolvedKey];
  const dimensions = ADMIN_ICON_ART_SIZES[size];

  return (
    <span
      className={cn(styles.iconArtFrame, styles[`iconArt_${size}`], className)}
      data-admin-icon-art={resolvedKey}
      data-admin-icon-art-size={size}
      aria-hidden="true"
    >
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        width={dimensions.width}
        height={dimensions.height}
        sizes={dimensions.sizes}
        className={styles.iconArtImage}
      />
    </span>
  );
}
