import type { ComponentProps, ReactNode } from "react";
import Image, { type ImageProps } from "next/image";
import { PanelsTopLeft, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./workspace-banner.module.css";
import {
  WORKSPACE_MASCOT_IMAGES,
  type WorkspaceMascotPose,
} from "./workspace-mascots";

type WorkspaceBannerProps = ComponentProps<"header"> & {
  eyebrow?: ReactNode;
  badgeIcon?: LucideIcon;
  mascot?: ReactNode;
  mascotImage?: ImageProps["src"];
  mascotPose?: WorkspaceMascotPose;
};

export function WorkspaceBanner({
  children,
  className,
  eyebrow = "Ruang kerja Anda",
  badgeIcon: Icon = PanelsTopLeft,
  mascot,
  mascotImage,
  mascotPose = "guide",
  ...props
}: WorkspaceBannerProps) {
  return (
    <header
      {...props}
      className={cn(styles.banner, className)}
      data-workspace-banner
    >
      <div className={styles.content}>
        <p className={styles.badge} data-workspace-banner-badge>
          <Icon size={14} aria-hidden="true" />
          {eyebrow}
        </p>
        <div className={styles.body}>{children}</div>
      </div>
      {mascot !== false && (
        <div
          className={styles.visual}
          data-workspace-banner-visual
          aria-hidden="true"
        >
          {mascot ?? (
            <Image
              src={mascotImage ?? WORKSPACE_MASCOT_IMAGES[mascotPose]}
              data-workspace-mascot-pose={mascotPose}
              width={160}
              height={160}
              sizes="(max-width: 639px) 0px, (max-width: 1023px) 120px, 144px"
              alt=""
              aria-hidden="true"
            />
          )}
        </div>
      )}
    </header>
  );
}
