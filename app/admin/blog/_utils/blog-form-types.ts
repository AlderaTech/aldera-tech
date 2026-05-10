export type BlogFormInitial = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  categoryId?: string;
  published?: boolean;
  scheduledAt?: string;
};

export type BlogCategoryOption = { id: string; name: string };
