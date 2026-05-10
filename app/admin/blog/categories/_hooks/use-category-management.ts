"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createBlogCategoryAction,
  deleteBlogCategoryAction,
  updateBlogCategoryAction,
  type BlogCategoryActionState,
} from "@/lib/actions/blog-category";
import { slugify } from "@/lib/utils";
import {
  emptyCategoryForm,
  type BlogCategoryRow,
  type CategoryFormValues,
} from "../_utils/category-types";

export function useCategoryManagement() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<BlogCategoryRow | null>(
    null
  );
  const [values, setValues] =
    React.useState<CategoryFormValues>(emptyCategoryForm);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isPending, startTransition] = React.useTransition();
  const slugDirtyRef = React.useRef(false);

  function openCreateDialog() {
    slugDirtyRef.current = false;
    setValues(emptyCategoryForm);
    setErrors({});
    setDialogOpen(true);
  }

  function openEditDialog(category: BlogCategoryRow) {
    slugDirtyRef.current = true;
    setValues({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
    });
    setErrors({});
    setDialogOpen(true);
  }

  function handleNameChange(name: string) {
    setValues((current) => ({
      ...current,
      name,
      slug: slugDirtyRef.current ? current.slug : slugify(name),
    }));
  }

  function handleSlugChange(slug: string) {
    slugDirtyRef.current = true;
    setValues((current) => ({ ...current, slug: slugify(slug) }));
  }

  function handleDescriptionChange(description: string) {
    setValues((current) => ({ ...current, description }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    formData.set("name", values.name);
    formData.set("slug", values.slug);
    formData.set("description", values.description);

    startTransition(async () => {
      const emptyState: BlogCategoryActionState = { ok: false };
      const result = values.id
        ? await updateBlogCategoryAction(values.id, emptyState, formData)
        : await createBlogCategoryAction(emptyState, formData);

      if (result.ok) {
        toast.success(result.message ?? "Kategori tersimpan");
        setDialogOpen(false);
        setValues(emptyCategoryForm);
        setErrors({});
        router.refresh();
        return;
      }

      setErrors(result.errors ?? {});
      toast.error(result.message ?? "Gagal menyimpan kategori");
    });
  }

  function handleDelete(category: BlogCategoryRow) {
    startTransition(async () => {
      const result = await deleteBlogCategoryAction(category.id);
      if (result.ok) {
        toast.success(result.message ?? "Kategori dihapus");
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(result.message ?? "Gagal menghapus kategori");
      }
    });
  }

  return {
    dialogOpen,
    setDialogOpen,
    deleteTarget,
    setDeleteTarget,
    values,
    errors,
    isPending,
    openCreateDialog,
    openEditDialog,
    handleNameChange,
    handleSlugChange,
    handleDescriptionChange,
    handleSubmit,
    handleDelete,
  };
}
