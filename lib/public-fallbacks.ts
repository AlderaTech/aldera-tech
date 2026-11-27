export type PublicCaseStudy = {
  id: string;
  slug: string;
  title: string;
  client: string;
  industry: string;
  summary: string;
  challenge: string;
  solution: string;
  result: string;
  featuredImage: string | null;
  techStack: string[];
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  published: boolean;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  views: number;
  isPinned: boolean;
  pinnedAt: Date | null;
  draftContent: string | null;
  draftSavedAt: Date | null;
  authorId: string;
  author: { name: string; avatar: string | null } | null;
  categoryId: string | null;
  category: { name: string; slug: string } | null;
  createdAt: Date;
  updatedAt: Date;
};

const caseStudyImages: Record<string, string> = {
  "technova-b2b-platform": "/images/portfolio/technova-b2b-platform.webp",
  "kopi-kita-ecommerce": "/images/portfolio/kopi-kita-ecommerce.webp",
  "finsmart-mobile-app": "/images/portfolio/finsmart-mobile-app.webp",
};
const blogImages: Record<string, string> = {
  "kenapa-bisnis-anda-butuh-website-modern":
    "/images/blog/modern-website-strategy.webp",
  "next-js-16-apa-yang-baru": "/images/blog/nextjs-16-development.webp",
  "micro-interactions-yang-meningkatkan-ux":
    "/images/blog/micro-interactions-ux.webp",
};
// Image mappings only: publication, text and pagination always come from the database.
export function resolveCaseStudyImage(slug: string, image: string | null) {
  if (image && image !== "/logo/logo-transparent.png") return image;
  return caseStudyImages[slug] ?? image;
}
export function resolveBlogPostImage(slug: string, image: string | null) {
  if (
    image &&
    image !== "/logo/logo-transparent.png" &&
    !image.startsWith("/images/portfolio/")
  )
    return image;
  return blogImages[slug] ?? image;
}
