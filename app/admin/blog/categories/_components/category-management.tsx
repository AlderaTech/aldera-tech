"use client";

import { Plus, Tags } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryFormDialog } from "./category-form-dialog";
import { CategoryStatGrid } from "./category-stat-grid";
import { CategoryTable } from "./category-table";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { useCategoryManagement } from "../_hooks/use-category-management";
import type {
  BlogCategoryPermissions,
  BlogCategoryRow,
} from "../_utils/category-types";

export function CategoryManagement({
  categories,
  permissions,
}: {
  categories: BlogCategoryRow[];
  permissions: BlogCategoryPermissions;
}) {
  const manager = useCategoryManagement();

  return (
    <div className="space-y-5">
      <CategoryStatGrid categories={categories} />

      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200 bg-slate-50/70">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tags className="size-4 text-primary" />
                Manajemen Kategori Blog
              </CardTitle>
              <p className="mt-1 text-sm text-slate-500">
                Atur nama, slug, dan deskripsi kategori yang tampil di halaman
                blog.
              </p>
            </div>
            {permissions.canCreate && (
              <Button onClick={manager.openCreateDialog}>
                <Plus className="size-4" /> Kategori Baru
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <CategoryTable
            categories={categories}
            permissions={permissions}
            onEdit={manager.openEditDialog}
            onDelete={manager.setDeleteTarget}
          />
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={manager.dialogOpen}
        onOpenChange={manager.setDialogOpen}
        values={manager.values}
        errors={manager.errors}
        pending={manager.isPending}
        onSubmit={manager.handleSubmit}
        onNameChange={manager.handleNameChange}
        onSlugChange={manager.handleSlugChange}
        onDescriptionChange={manager.handleDescriptionChange}
      />

      <DeleteCategoryDialog
        target={manager.deleteTarget}
        pending={manager.isPending}
        onOpenChange={(open) => {
          if (!open) manager.setDeleteTarget(null);
        }}
        onConfirm={() => {
          if (manager.deleteTarget) manager.handleDelete(manager.deleteTarget);
        }}
      />
    </div>
  );
}

export type { BlogCategoryPermissions, BlogCategoryRow };
