"use client";

import { BlogCategoryCard } from "./blog-category-card";
import { BlogContentFields } from "./blog-content-fields";
import { BlogFeaturedImageCard } from "./blog-featured-image-card";
import { BlogPublishCard } from "./blog-publish-card";
import { useBlogForm } from "../_hooks/use-blog-form";
import type {
  BlogCategoryOption,
  BlogFormInitial,
} from "../_utils/blog-form-types";

export type { BlogFormInitial } from "../_utils/blog-form-types";

export function BlogForm({
  initial,
  categories,
}: {
  initial?: BlogFormInitial;
  categories: BlogCategoryOption[];
}) {
  const form = useBlogForm(initial);

  return (
    <form onSubmit={form.handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <BlogContentFields form={form} />
        <div className="space-y-6">
          <BlogPublishCard form={form} initial={initial} />
          <BlogFeaturedImageCard form={form} />
          <BlogCategoryCard form={form} categories={categories} />
        </div>
      </div>
    </form>
  );
}
