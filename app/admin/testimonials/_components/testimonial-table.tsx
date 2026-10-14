"use client";

import * as React from "react";
import Image from "next/image";
import {
  Star,
  Search,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toggleTestimonialPublishAction } from "@/lib/actions/testimonial";
import type { TestimonialItem } from "../_utils/testimonial-types";

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
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "published" | "draft"
  >("all");
  const [pendingToggleId, setPendingToggleId] = React.useState<string | null>(
    null
  );

  const filtered = React.useMemo(() => {
    return items.filter((it) => {
      const matchSearch =
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
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari nama klien, ulasan, atau proyek..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            className="h-8 text-xs"
          >
            Semua ({items.length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "published" ? "default" : "outline"}
            onClick={() => setStatusFilter("published")}
            className="h-8 text-xs"
          >
            Published ({items.filter((i) => i.published).length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "draft" ? "default" : "outline"}
            onClick={() => setStatusFilter("draft")}
            className="h-8 text-xs"
          >
            Menunggu Kurasi ({items.filter((i) => !i.published).length})
          </Button>
        </div>
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
          {filtered.length === 0 ? (
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
            filtered.map((item) => (
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
    </div>
  );
}
