import Image from "next/image";
import { cn } from "@/lib/utils";
import styles from "./admin-common.module.css";

export const ADMIN_MASCOT_POSES = {
  guide: {
    src: "/images/dashboard/profile/aldera-profile-guide.webp",
    aspect: "portrait",
  },
  activity: {
    src: "/images/dashboard/profile/aldera-profile-activity.webp",
    aspect: "square",
  },
  portfolio: {
    src: "/images/portfolio/aldera-cat-portfolio.webp",
    aspect: "portrait",
  },
  blog: {
    src: "/images/blog/aldera-cat-reading.webp",
    aspect: "portrait",
  },
  relay: {
    src: "/images/services/cards/ai.webp",
    aspect: "square",
  },
  coding: {
    src: "/images/services/cards/web.webp",
    aspect: "square",
  },
  assistant: {
    src: "/images/services/cards/cloud.webp",
    aspect: "square",
  },
  services: {
    src: "/images/services/aldera-cat-services.webp",
    aspect: "portrait",
  },
  vision: {
    src: "/images/about/aldera-cat-vision.webp",
    aspect: "portrait",
  },
  contact: {
    src: "/images/contact/aldera-cat-contact.webp",
    aspect: "portrait",
  },
  users: {
    src: "/images/auth/aldera-cat-register.webp",
    aspect: "portrait",
  },
  security: {
    src: "/images/auth/aldera-cat-login.webp",
    aspect: "portrait",
  },
} as const;

export const ADMIN_MASCOT_SIZES = {
  hero: {
    width: 112,
    height: 112,
    sizes: "(max-width: 639px) 0px, 112px",
  },
  header: {
    width: 76,
    height: 76,
    sizes: "(max-width: 639px) 0px, 76px",
  },
  panel: {
    width: 48,
    height: 48,
    sizes: "48px",
  },
  empty: {
    width: 92,
    height: 92,
    sizes: "92px",
  },
} as const;

export type AdminMascotPose = keyof typeof ADMIN_MASCOT_POSES;
export type AdminMascotSize = keyof typeof ADMIN_MASCOT_SIZES;

export function AdminMascot({
  pose = "guide",
  size = "header",
  className,
}: {
  pose?: AdminMascotPose;
  size?: AdminMascotSize;
  className?: string;
}) {
  const asset = ADMIN_MASCOT_POSES[pose];
  const dimensions = ADMIN_MASCOT_SIZES[size];

  return (
    <span
      className={cn(styles.mascotFrame, styles[`mascot_${size}`], className)}
      data-admin-mascot={pose}
      data-admin-mascot-size={size}
      data-admin-mascot-aspect={asset.aspect}
      aria-hidden="true"
    >
      <Image
        src={asset.src}
        alt=""
        aria-hidden="true"
        width={dimensions.width}
        height={dimensions.height}
        sizes={dimensions.sizes}
        className={styles.mascotImage}
      />
    </span>
  );
}
