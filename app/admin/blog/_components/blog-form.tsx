"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/utils";
import {
  createBlogPostAction,
  updateBlogPostAction,
  autoSaveDraftAction,
  type BlogActionState,
} from "@/lib/actions/blog";

const TipTapEditor = dynamic(
  () => import("@/components/editor/tiptap-editor").then((m) => m.TipTapEditor),
  { ssr: false, loading: () => <div className="h-96 border rounded-lg shimmer-bg" /> }
);

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

type Category = { id: string; name: string };

export function BlogForm({
  initial,
  categories,
}: {
  initial?: BlogFormInitial;
  categories: Category[];
}) {
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

  // Auto-save draft every 3s of inactivity (only for existing posts)
  React.useEffect(() => {
    if (!initial?.id) return;
    if (!content) return;
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
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isPending, startTransition] = React.useTransition();
  const [uploading, setUploading] = React.useState(false);
  // Track whether user manually edited the slug so we stop auto-syncing it.
  const slugDirtyRef = React.useRef(Boolean(initial?.id || initial?.slug));

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
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Override with controlled values
    fd.set("title", title);
    fd.set("slug", slug);
    fd.set("excerpt", excerpt);
    fd.set("content", content);
    fd.set("featuredImage", featuredImage);
    fd.set("categoryId", categoryId);
    fd.set("published", published ? "true" : "false");
    fd.set("scheduledAt", !published && scheduledAt ? scheduledAt : "");

    startTransition(async () => {
      const empty: BlogActionState = { ok: false };
      const result = initial?.id
        ? await updateBlogPostAction(initial.id, empty, fd)
        : await createBlogPostAction(empty, fd);
      if (result.ok) {
        setErrors({});
        toast.success(result.message ?? "Tersimpan");
        router.push("/admin/blog");
        router.refresh();
      } else {
        setErrors(result.errors ?? {});
        toast.error(result.message ?? "Gagal menyimpan");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Judul artikel yang menarik…"
              required
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="kenapa-website-anda-butuh-seo"
              required
            />
            {errors.slug && (
              <p className="text-xs text-destructive">{errors.slug}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Ringkasan singkat (untuk listing dan SEO)"
            />
          </div>

          <div className="space-y-2">
            <Label>Konten</Label>
            <TipTapEditor
              value={content}
              onChange={setContent}
              placeholder="Mulai menulis artikel Anda…"
            />
            {errors.content && (
              <p className="text-xs text-destructive">{errors.content}</p>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="published">Status</Label>
                <p className="text-xs text-muted-foreground">
                  {published
                    ? "Terpublish"
                    : scheduledAt
                      ? `Terjadwal ${new Date(scheduledAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}`
                      : "Draft"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={published}
                onClick={() => setPublished((p) => !p)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  published ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block size-4 transform rounded-full bg-background transition-transform ${
                    published ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {!published && (
              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="scheduledAt" className="text-xs">
                  Jadwalkan publish (opsional)
                </Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="text-xs"
                />
                {scheduledAt && (
                  <button
                    type="button"
                    onClick={() => setScheduledAt("")}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Hapus jadwal
                  </button>
                )}
              </div>
            )}

            {initial?.id && (lastSavedAt || isSaving) && (
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-2 border-t">
                {isSaving ? (
                  <>
                    <Loader2 className="size-3 animate-spin" /> Menyimpan draft…
                  </>
                ) : lastSavedAt ? (
                  <>
                    <span className="size-1.5 rounded-full bg-success" />
                    Draft tersimpan{" "}
                    {new Date(lastSavedAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </>
                ) : null}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Menyimpan…
                </>
              ) : (
                <>
                  <Save className="size-4" /> Simpan
                </>
              )}
            </Button>
          </Card>

          <Card className="p-6 space-y-3">
            <Label>Featured Image</Label>
            {featuredImage ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featuredImage}
                  alt="Featured"
                  className="w-full aspect-[16/9] object-cover rounded-md border"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setFeaturedImage("")}
                  className="w-full"
                >
                  Hapus
                </Button>
              </div>
            ) : (
              <label className="border border-dashed rounded-md p-6 text-center text-sm text-muted-foreground hover:bg-muted/30 cursor-pointer block transition-colors">
                <Upload className="size-5 mx-auto mb-2" />
                {uploading ? "Mengunggah…" : "Klik untuk upload gambar"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFeaturedImageUpload(file);
                  }}
                />
              </label>
            )}
          </Card>

          <Card className="p-6 space-y-3">
            <Label htmlFor="categoryId">Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="categoryId">
                <SelectValue placeholder="Pilih kategori…" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        </div>
      </div>
    </form>
  );
}
