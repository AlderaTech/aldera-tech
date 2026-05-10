"use client";

import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { useBlogForm } from "../_hooks/use-blog-form";

type BlogFormState = ReturnType<typeof useBlogForm>;

export function BlogFeaturedImageCard({ form }: { form: BlogFormState }) {
  const { values, setters, state } = form;

  return (
    <Card className="space-y-3 p-6">
      <Label>Featured Image</Label>
      {values.featuredImage ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={values.featuredImage}
            alt="Featured"
            className="aspect-[16/9] w-full rounded-md border object-cover"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setters.setFeaturedImage("")}
            className="w-full"
          >
            Hapus
          </Button>
        </div>
      ) : (
        <label className="block cursor-pointer rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/30">
          <Upload className="mx-auto mb-2 size-5" />
          {state.uploading ? "Mengunggah..." : "Klik untuk upload gambar"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={state.uploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) form.handleFeaturedImageUpload(file);
            }}
          />
        </label>
      )}
    </Card>
  );
}
