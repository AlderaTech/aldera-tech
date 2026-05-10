export type BlogCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  _count: { posts: number };
};

export type BlogCategoryPermissions = {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export type CategoryFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
};

export const emptyCategoryForm: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
};
