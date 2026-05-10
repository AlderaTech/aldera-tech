"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  autoSaveDraftAction,
  createBlogPostAction,
  updateBlogPostAction,
  type BlogActionState,
} from "@/lib/actions/blog";
import { ADMIN_ROUTES } from "@/lib/routes";
import { slugify } from "@/lib/utils";
import type { BlogFormInitial } from "../_utils/blog-form-types";

export function useBlogForm(initial?: BlogFormInitial) {
  const router = useRouter();
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = React.useState(initial?.excerpt ?? "");
  const [content, setContent] = React.useState(initial?.content ?? "");
  const [featuredImage, setFeaturedImage] = React.useState(
    initial?.featuredImage ?? ""
  );
  const [categoryId, setCategoryId] = React.useState(initial?.categoryId ?? "");
  const [published, setPublished] = React.useState(Boolean(initial?.published));
  const [scheduledAt, setScheduledAt] = React.useState(initial?.scheduledAt ?? "");
  const [lastSavedAt, setLastSavedAt] = React.useState<Date | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isPending, startTransition] = React.useTransition();
  const [uploading, setUploading] = React.useState(false);
  const slugDirtyRef = React.useRef(Boolean(initial?.id || initial?.slug));

  React.useEffect(() => {
    if (!initial?.id || !content) return;
    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        const res = await autoSaveDraftAction(initial.id!, content);
        if (res.ok && res.savedAt) setLastSavedAt(new Date(res.savedAt));
      } finally {
        setIsSaving(false);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [content, initial?.id]);

  function handleTitleChange(nextTitle: string) {
    setTitle(nextTitle);
    if (!slugDirtyRef.current) {
      setSlug(slugify(nextTitle));
    }
  }

  function handleSlugChange(nextSlug: string) {
    slugDirtyRef.current = true;
    setSlug(slugify(nextSlug));
  }

  async function handleFeaturedImageUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = (await res.json()) as { url: string };
      setFeaturedImage(data.url);
      toast.success("Gambar terunggah");
    } catch (err) {
      toast.error("Gagal mengunggah: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("excerpt", excerpt);
    formData.set("content", content);
    formData.set("featuredImage", featuredImage);
    formData.set("categoryId", categoryId);
    formData.set("published", published ? "true" : "false");
    formData.set("scheduledAt", !published && scheduledAt ? scheduledAt : "");

    startTransition(async () => {
      const empty: BlogActionState = { ok: false };
      const result = initial?.id
        ? await updateBlogPostAction(initial.id, empty, formData)
        : await createBlogPostAction(empty, formData);

      if (result.ok) {
        setErrors({});
        toast.success(result.message ?? "Tersimpan");
        router.push(ADMIN_ROUTES.blog);
        router.refresh();
      } else {
        setErrors(result.errors ?? {});
        toast.error(result.message ?? "Gagal menyimpan");
      }
    });
  }

  return {
    values: {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      categoryId,
      published,
      scheduledAt,
    },
    setters: {
      setExcerpt,
      setContent,
      setFeaturedImage,
      setCategoryId,
      setPublished,
      setScheduledAt,
    },
    draft: { lastSavedAt, isSaving },
    state: { errors, isPending, uploading },
    handleTitleChange,
    handleSlugChange,
    handleFeaturedImageUpload,
    handleSubmit,
  };
}
