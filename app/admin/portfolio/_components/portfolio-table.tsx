"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Pencil,
  Search,
  Trash2,
  Eye,
  EyeOff,
  Briefcase,
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
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import {
  deleteCaseStudyAction,
  toggleCaseStudyPublishAction,
} from "@/lib/actions/portfolio";
import type { PortfolioCaseStudyItem } from "../_utils/portfolio-types";
import { DeletePortfolioDialog } from "./delete-portfolio-dialog";

export function PortfolioTable({ items }: { items: PortfolioCaseStudyItem[] }) {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "published" | "draft"
  >("all");
  const [deleteTarget, setDeleteTarget] =
    React.useState<PortfolioCaseStudyItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [pendingToggleId, setPendingToggleId] = React.useState<string | null>(
    null
  );

  const filtered = React.useMemo(() => {
    return items.filter((it) => {
      const matchSearch =
        it.title.toLowerCase().includes(search.toLowerCase()) ||
        it.client.toLowerCase().includes(search.toLowerCase()) ||
        it.industry.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && it.published) ||
        (statusFilter === "draft" && !it.published);
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  const handleTogglePublish = async (item: PortfolioCaseStudyItem) => {
    setPendingToggleId(item.id);
    try {
      const res = await toggleCaseStudyPublishAction(item.id, !item.published);
      if (res.ok) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message || "Gagal mengubah status publikasi");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setPendingToggleId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteCaseStudyAction(deleteTarget.id);
      if (res.ok) {
        toast.success(res.message || "Studi kasus berhasil dihapus");
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(res.message || "Gagal menghapus studi kasus");
      }
    } catch {
      toast.error("Gagal menghapus studi kasus");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari judul, klien, atau industri..."
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
            Draft ({items.filter((i) => !i.published).length})
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Judul & Klien</TableHead>
            <TableHead className="hidden md:table-cell">Industri</TableHead>
            <TableHead className="hidden lg:table-cell">Teknologi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden text-center sm:table-cell">
              Urutan
            </TableHead>
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
                <Briefcase className="mx-auto mb-2 size-8 opacity-40" />
                Tidak ada studi kasus yang sesuai.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="leading-tight font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Klien: {item.client}
                  </p>
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                  {item.industry}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex max-w-xs flex-wrap gap-1">
                    {item.techStack.slice(0, 3).map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="px-1.5 py-0 font-mono text-[10px]"
                      >
                        {t}
                      </Badge>
                    ))}
                    {item.techStack.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{item.techStack.length - 3}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={item.published ? "success" : "secondary"}>
                    {item.published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-center font-mono text-xs sm:table-cell">
                  {item.order}
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
                      asChild
                      title="Lihat live"
                    >
                      <Link
                        href={PUBLIC_ROUTES.portfolioDetail(item.slug)}
                        target="_blank"
                      >
                        <ExternalLink className="size-3.5" />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      asChild
                      title="Edit"
                    >
                      <Link href={ADMIN_ROUTES.portfolioEdit(item.id)}>
                        <Pencil className="size-3.5" />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-destructive hover:bg-destructive/10"
                      title="Hapus"
                      onClick={() => setDeleteTarget(item)}
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

      <DeletePortfolioDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.title ?? ""}
        isPending={isDeleting}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
