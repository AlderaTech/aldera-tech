"use client";

import * as React from "react";
import Image from "next/image";
import {
  Star,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  User,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toggleTestimonialPublishAction } from "@/lib/actions/testimonial";
import type { TestimonialItem } from "../_utils/testimonial-types";
import { useUrlState } from "@/lib/hooks/use-url-state";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { DataPagination } from "@/components/shared/data-pagination";

export function TestimonialTable({
  items,
  onEdit,
  onDelete,
  onRefresh,
}: {
  items: TestimonialItem[];
  onEdit: (item: TestimonialItem) => void;
  onDelete: (item: TestimonialItem) => void;
  onRefresh: () => void;
}) {
  const { getParam, setParam } = useUrlState();
  const search = getParam("q", "");
  const statusFilter = getParam("status", "all").toLowerCase();
  const currentPage = Math.max(1, Number(getParam("page", "1")) || 1);
  const PAGE_SIZE = 10;

  const [pendingToggleId, setPendingToggleId] = React.useState<string | null>(
    null
  );

  const filtered = React.useMemo(() => {
    return items.filter((it) => {
      const matchSearch =
        !search ||
        it.clientName.toLowerCase().includes(search.toLowerCase()) ||
        (it.clientRole &&
          it.clientRole.toLowerCase().includes(search.toLowerCase())) ||
        it.content.toLowerCase().includes(search.toLowerCase()) ||
        (it.project?.title &&
          it.project.title.toLowerCase().includes(search.toLowerCase()));
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && it.published) ||
        (statusFilter === "draft" && !it.published);
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  const totalItems = filtered.length;
  const paginatedItems = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleTogglePublish = async (item: TestimonialItem) => {
    setPendingToggleId(item.id);
    try {
      const res = await toggleTestimonialPublishAction(
        item.id,
        !item.published
      );
      if (res.ok) {
        toast.success(res.message);
        onRefresh();
      } else {
        toast.error(res.message || "Gagal mengubah status publikasi");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setPendingToggleId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4">
        <SearchFilterBar
          placeholder="Cari nama klien, ulasan, atau proyek..."
          searchParamKey="q"
        >
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setParam("status", null, { resetPage: true })}
              className="h-8 text-xs"
            >
              Semua ({items.length})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={statusFilter === "published" ? "default" : "outline"}
              onClick={() =>
                setParam("status", "published", { resetPage: true })
              }
              className="h-8 text-xs"
            >
              Published ({items.filter((i) => i.published).length})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={statusFilter === "draft" ? "default" : "outline"}
              onClick={() => setParam("status", "draft", { resetPage: true })}
              className="h-8 text-xs"
            >
              Menunggu Kurasi ({items.filter((i) => !i.published).length})
            </Button>
          </div>
        </SearchFilterBar>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Klien</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead className="hidden md:table-cell">Ulasan</TableHead>
            <TableHead className="hidden lg:table-cell">
              Proyek Terkait
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedItems.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-muted-foreground"
              >
                <MessageSquare className="mx-auto mb-2 size-8 opacity-40" />
                Tidak ada testimoni yang ditemukan.
              </TableCell>
            </TableRow>
          ) : (
            paginatedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
                      {item.avatar ? (
                        <Image
                          src={item.avatar}
                          alt={item.clientName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <User className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm leading-tight font-semibold text-foreground">
                        {item.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.clientRole || "-"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`size-3.5 ${
                          star <= item.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-xs font-semibold">
                      {item.rating}.0
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden max-w-sm truncate text-xs text-slate-700 md:table-cell">
                  &ldquo;{item.content}&rdquo;
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                  {item.project ? (
                    <Badge
                      variant="outline"
                      className="max-w-[180px] truncate text-[11px] font-normal"
                    >
                      {item.project.title}
                    </Badge>
                  ) : (
                    <span className="text-slate-400 italic">Umum</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={item.published ? "success" : "secondary"}
                    className="text-xs"
                  >
                    {item.published ? "Published" : "Menunggu Kurasi"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      title={item.published ? "Sembunyikan" : "Publikasikan"}
                      disabled={pendingToggleId === item.id}
                      onClick={() => handleTogglePublish(item)}
                    >
                      {item.published ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      title="Edit"
                      onClick={() => onEdit(item)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-destructive hover:bg-destructive/10"
                      title="Hapus"
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <DataPagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
