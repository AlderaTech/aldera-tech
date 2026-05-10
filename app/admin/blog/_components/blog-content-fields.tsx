"use client";

import dynamic from "next/dynamic";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { useBlogForm } from "../_hooks/use-blog-form";

const TipTapEditor = dynamic(
  () => import("@/components/editor/tiptap-editor").then((m) => m.TipTapEditor),
  {
    ssr: false,
    loading: () => <div className="h-96 rounded-lg border shimmer-bg" />,
  }
);

type BlogFormState = ReturnType<typeof useBlogForm>;

export function BlogContentFields({ form }: { form: BlogFormState }) {
  const { values, setters, state } = form;

  return (
    <Card className="space-y-5 p-6">
      <div className="space-y-2">
        <Label htmlFor="title">Judul</Label>
        <Input
          id="title"
          value={values.title}
          onChange={(event) => form.handleTitleChange(event.target.value)}
          placeholder="Judul artikel yang menarik..."
          required
        />
        {state.errors.title && (
          <p className="text-xs text-destructive">{state.errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={values.slug}
          onChange={(event) => form.handleSlugChange(event.target.value)}
          placeholder="kenapa-website-anda-butuh-seo"
          required
        />
        {state.errors.slug && (
          <p className="text-xs text-destructive">{state.errors.slug}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={values.excerpt}
          onChange={(event) => setters.setExcerpt(event.target.value)}
          rows={3}
          placeholder="Ringkasan singkat (untuk listing dan SEO)"
        />
      </div>

      <div className="space-y-2">
        <Label>Konten</Label>
        <TipTapEditor
          value={values.content}
          onChange={setters.setContent}
          placeholder="Mulai menulis artikel Anda..."
        />
        {state.errors.content && (
          <p className="text-xs text-destructive">{state.errors.content}</p>
        )}
      </div>
    </Card>
  );
}
