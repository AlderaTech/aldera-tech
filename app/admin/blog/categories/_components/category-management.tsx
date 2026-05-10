"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Edit3,
  FileText,
  Hash,
  Loader2,
  Plus,
  Tags,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  createBlogCategoryAction,
  deleteBlogCategoryAction,
  updateBlogCategoryAction,
  type BlogCategoryActionState,
} from "@/lib/actions/blog-category";
import { slugify } from "@/lib/utils";

export type BlogCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  _count: { posts: number };
};

type CategoryFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
};

const emptyForm: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
};

export function CategoryManagement({
  categories,
  permissions,
}: {
  categories: BlogCategoryRow[];
  permissions: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<BlogCategoryRow | null>(
    null
  );
  const [values, setValues] = React.useState<CategoryFormValues>(emptyForm);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isPending, startTransition] = React.useTransition();
  const slugDirtyRef = React.useRef(false);

  const assignedPosts = categories.reduce(
    (total, category) => total + category._count.posts,
    0
  );
  const emptyCategories = categories.filter(
    (category) => category._count.posts === 0
  ).length;

  function openCreateDialog() {
    slugDirtyRef.current = false;
    setValues(emptyForm);
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
        setValues(emptyForm);
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

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <StatCard
          icon={Tags}
          label="Total Kategori"
          value={categories.length}
          helper="Taxonomy aktif untuk artikel"
        />
        <StatCard
          icon={FileText}
          label="Post Terkategori"
          value={assignedPosts}
          helper="Artikel yang memakai kategori"
        />
        <StatCard
          icon={Hash}
          label="Kategori Kosong"
          value={emptyCategories}
          helper="Perlu dipakai atau dirapikan"
        />
      </div>

      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200 bg-slate-50/70">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tags className="size-4 text-primary" />
                Manajemen Kategori Blog
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Atur nama, slug, dan deskripsi kategori yang tampil di halaman blog.
              </p>
            </div>
            {permissions.canCreate && (
              <Button onClick={openCreateDialog}>
                <Plus className="size-4" /> Kategori Baru
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori</TableHead>
                <TableHead className="hidden md:table-cell">Slug</TableHead>
                <TableHead className="hidden lg:table-cell">Deskripsi</TableHead>
                <TableHead className="w-28">Post</TableHead>
                <TableHead className="w-28 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    {permissions.canCreate
                      ? "Belum ada kategori blog. Buat kategori pertama untuk merapikan artikel."
                      : "Belum ada kategori blog."}
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="font-medium text-slate-950">
                        {category.name}
                      </div>
                      <div className="mt-1 text-xs text-slate-500 md:hidden">
                        {category.slug}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <code className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell className="hidden max-w-md truncate text-sm text-slate-500 lg:table-cell">
                      {category.description || "Belum ada deskripsi"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {category._count.posts} post
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {permissions.canEdit || permissions.canDelete ? (
                        <div className="inline-flex items-center gap-1">
                          {permissions.canEdit && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              aria-label={`Edit ${category.name}`}
                              onClick={() => openEditDialog(category)}
                            >
                              <Edit3 className="size-4" />
                            </Button>
                          )}
                          {permissions.canDelete && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              aria-label={`Hapus ${category.name}`}
                              onClick={() => setDeleteTarget(category)}
                            >
                              <Trash2 className="size-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Lihat saja</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  onChange={(event) => handleNameChange(event.target.value)}
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
                  onChange={(event) => handleSlugChange(event.target.value)}
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
                  onChange={(event) =>
                    setValues((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
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
                disabled={isPending}
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="size-4 animate-spin" />}
                Simpan Kategori
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Hapus kategori blog?"
        description={
          deleteTarget
            ? `${deleteTarget._count.posts} post akan kehilangan kategori ini, tetapi artikelnya tetap tersimpan.`
            : "Kategori akan dihapus."
        }
        confirmLabel="Hapus kategori"
        destructive
        pending={isPending}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
        }}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-semibold tabular-nums text-slate-950">
            {value}
          </div>
          <div className="text-sm font-medium text-slate-700">{label}</div>
          <div className="truncate text-xs text-slate-500">{helper}</div>
        </div>
      </CardContent>
    </Card>
  );
}
