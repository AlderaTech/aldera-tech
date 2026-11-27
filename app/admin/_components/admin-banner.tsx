import type { ComponentProps } from "react";
import { WorkspaceBanner } from "@/components/dashboard/workspace-banner";
import {
  ADMIN_BANNER_CATEGORIES,
  type AdminBannerCategory,
} from "../_data/admin-banner-categories";

type AdminBannerProps = Omit<
  ComponentProps<typeof WorkspaceBanner>,
  "eyebrow"
> & {
  category: AdminBannerCategory;
};

export function AdminBanner({
  category,
  badgeIcon,
  ...props
}: AdminBannerProps) {
  const preset = ADMIN_BANNER_CATEGORIES[category];
  return (
    <WorkspaceBanner
      {...props}
      eyebrow={preset.label}
      badgeIcon={badgeIcon ?? preset.icon}
      data-admin-category={category}
      data-admin-page-header
    />
  );
}
