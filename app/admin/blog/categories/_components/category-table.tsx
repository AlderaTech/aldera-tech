import { Edit3, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  BlogCategoryPermissions,
  BlogCategoryRow,
} from "../_utils/category-types";

type CategoryTableProps = {
  categories: BlogCategoryRow[];
  permissions: BlogCategoryPermissions;
  onEdit: (category: BlogCategoryRow) => void;
  onDelete: (category: BlogCategoryRow) => void;
};

export function CategoryTable({
  categories,
  permissions,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  return (
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
          <EmptyCategoryRow canCreate={permissions.canCreate} />
        ) : (
          categories.map((category) => (
            <CategoryTableRow
              key={category.id}
              category={category}
              permissions={permissions}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}

function EmptyCategoryRow({ canCreate }: { canCreate: boolean }) {
  return (
    <TableRow>
      <TableCell
        colSpan={5}
        className="py-12 text-center text-sm text-muted-foreground"
      >
        {canCreate
          ? "Belum ada kategori blog. Buat kategori pertama untuk merapikan artikel."
          : "Belum ada kategori blog."}
      </TableCell>
    </TableRow>
  );
}

function CategoryTableRow({
  category,
  permissions,
  onEdit,
  onDelete,
}: {
  category: BlogCategoryRow;
  permissions: BlogCategoryPermissions;
  onEdit: (category: BlogCategoryRow) => void;
  onDelete: (category: BlogCategoryRow) => void;
}) {
  return (
    <TableRow>
      <TableCell>
        <div className="font-medium text-slate-950">{category.name}</div>
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
        <Badge variant="secondary">{category._count.posts} post</Badge>
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
                onClick={() => onEdit(category)}
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
                onClick={() => onDelete(category)}
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
  );
}
