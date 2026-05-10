"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, ExternalLink, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BulkActionBar } from "@/components/dashboard/bulk-action-bar";
import {
  bulkBlogPublishAction,
  bulkBlogDeleteAction,
} from "@/lib/actions/bulk";
import { BlogRowActions } from "./blog-row-actions";
import { formatDate } from "@/lib/utils";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";

type BlogRow = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  category: { name: string } | null;
  author: { name: string } | null;
};

export function BlogTable({ posts }: { posts: BlogRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const allSelected = posts.length > 0 && selected.size === posts.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(posts.map((p) => p.id)));
  }

  return (
    <div className="space-y-3">
      <BulkActionBar
        selectedIds={[...selected]}
        onClear={() => setSelected(new Set())}
        actions={[
          {
            label: "Publish",
            icon: <Eye className="size-3.5" />,
            onClick: async (ids) => {
              const r = await bulkBlogPublishAction(ids, true);
              if (r.ok) toast.success(`${r.count} post dipublish`);
              setSelected(new Set());
              router.refresh();
            },
          },
          {
            label: "Unpublish",
            icon: <EyeOff className="size-3.5" />,
            onClick: async (ids) => {
              const r = await bulkBlogPublishAction(ids, false);
              if (r.ok) toast.success(`${r.count} post di-unpublish`);
              setSelected(new Set());
              router.refresh();
            },
          },
          {
            label: "Hapus",
            icon: <Trash2 className="size-3.5" />,
            destructive: true,
            confirm: "Hapus {count} post? Aksi tidak bisa di-undo.",
            onClick: async (ids) => {
              const r = await bulkBlogDeleteAction(ids);
              if (r.ok) toast.success(`${r.count} post dihapus`);
              setSelected(new Set());
              router.refresh();
            },
          },
        ]}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={toggleAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Judul</TableHead>
            <TableHead className="hidden md:table-cell">Kategori</TableHead>
            <TableHead className="hidden lg:table-cell">Penulis</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Tanggal</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center text-muted-foreground py-10"
              >
                Belum ada post. Buat yang pertama!
              </TableCell>
            </TableRow>
          ) : (
            posts.map((p) => (
              <TableRow
                key={p.id}
                data-state={selected.has(p.id) ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={selected.has(p.id)}
                    onCheckedChange={() => toggle(p.id)}
                    aria-label={`Select ${p.title}`}
                  />
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate">
                  {p.title}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {p.category?.name ?? "-"}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {p.author?.name ?? "-"}
                </TableCell>
                <TableCell>
                  <Badge variant={p.published ? "success" : "secondary"}>
                    {p.published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                  {formatDate(p.publishedAt ?? p.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1">
                    {p.published && (
                      <Button asChild size="icon" variant="ghost">
                        <Link
                          href={PUBLIC_ROUTES.blogDetail(p.slug)}
                          target="_blank"
                          aria-label="Lihat di frontend"
                        >
                          <ExternalLink className="size-4" />
                        </Link>
                      </Button>
                    )}
                    <Button asChild size="icon" variant="ghost">
                      <Link
                        href={ADMIN_ROUTES.blogEdit(p.id)}
                        aria-label="Edit"
                      >
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <BlogRowActions id={p.id} published={p.published} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
