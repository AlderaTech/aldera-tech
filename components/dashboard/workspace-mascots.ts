/** Aset dekoratif untuk banner; ilustrasi empty state memakai sumbernya sendiri. */
export const WORKSPACE_MASCOT_IMAGES = {
  guide: "/images/dashboard/profile/aldera-profile-guide.webp",
  profile: "/images/dashboard/profile/aldera-profile-guide.webp",
  projects: "/images/about/aldera-cat-about.webp",
  invoice: "/images/dashboard/banners/aldera-cat-invoice.webp",
  calculator: "/images/dashboard/banners/aldera-cat-calculator.webp",
  orders: "/images/dashboard/profile/aldera-profile-activity.webp",
} as const;

export type WorkspaceMascotPose = keyof typeof WORKSPACE_MASCOT_IMAGES;
