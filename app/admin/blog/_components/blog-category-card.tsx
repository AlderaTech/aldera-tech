"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { useBlogForm } from "../_hooks/use-blog-form";
import type { BlogCategoryOption } from "../_utils/blog-form-types";

type BlogFormState = ReturnType<typeof useBlogForm>;

export function BlogCategoryCard({
  form,
  categories,
}: {
  form: BlogFormState;
  categories: BlogCategoryOption[];
}) {
  return (
    <Card className="space-y-3 p-6">
      <Label htmlFor="categoryId">Kategori</Label>
      <Select
        value={form.values.categoryId}
        onValueChange={form.setters.setCategoryId}
      >
        <SelectTrigger id="categoryId">
          <SelectValue placeholder="Pilih kategori..." />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Card>
  );
}
