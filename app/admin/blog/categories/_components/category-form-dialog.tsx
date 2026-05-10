"use client";

import type { FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryFormValues } from "../_utils/category-types";

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: CategoryFormValues;
  errors: Record<string, string>;
  pending: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onNameChange: (name: string) => void;
  onSlugChange: (slug: string) => void;
  onDescriptionChange: (description: string) => void;
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  values,
  errors,
  pending,
  onSubmit,
  onNameChange,
  onSlugChange,
  onDescriptionChange,
}: CategoryFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>
              {values.id ? "Edit Kategori Blog" : "Kategori Blog Baru"}
            </DialogTitle>
            <DialogDescription>
              Slug dipakai untuk filter publik, jadi gunakan teks yang pendek dan stabil.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nama Kategori</Label>
              <Input
                id="category-name"
                name="name"
                value={values.name}
                onChange={(event) => onNameChange(event.target.value)}
                placeholder="Contoh: Product Strategy"
                aria-invalid={Boolean(errors.name)}
                required
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                name="slug"
                value={values.slug}
                onChange={(event) => onSlugChange(event.target.value)}
                placeholder="product-strategy"
                aria-invalid={Boolean(errors.slug)}
                required
              />
              {errors.slug && (
                <p className="text-xs text-destructive">{errors.slug}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description">Deskripsi</Label>
              <Textarea
                id="category-description"
                name="description"
                value={values.description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder="Ringkasan singkat tentang topik kategori ini"
                rows={3}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Simpan Kategori
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
