"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Pencil,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import {
  deleteCaseStudyAction,
  toggleCaseStudyPublishAction,
} from "@/lib/actions/portfolio";
import type { PortfolioCaseStudyItem } from "../_utils/portfolio-types";
import { DeletePortfolioDialog } from "./delete-portfolio-dialog";
import { useUrlState } from "@/lib/hooks/use-url-state";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { DataPagination } from "@/components/shared/data-pagination";

export function PortfolioTable({ items }: { items: PortfolioCaseStudyItem[] }) {
  const router = useRouter();
  const { getParam, setParam } = useUrlState();
  const search = getParam("q", "");
  const statusFilter = getParam("status", "all").toLowerCase();
  const currentPage = Math.max(1, Number(getParam("page", "1")) || 1);
  const PAGE_SIZE = 10;

  const [deleteTarget, setDeleteTarget] =
    React.useState<PortfolioCaseStudyItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [pendingToggleId, setPendingToggleId] = React.useState<string | null>(
    null
  );

  const filtered = React.useMemo(() => {
    return items.filter((it) => {
      const matchSearch =
        !search ||
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

  const totalItems = filtered.length;
  const paginatedItems = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

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
      <div className="p-4">
        <SearchFilterBar
          placeholder="Cari judul, klien, atau industri..."
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
              Draft ({items.filter((i) => !i.published).length})
            </Button>
          </div>
        </SearchFilterBar>
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
          {paginatedItems.length === 0 ? (
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
            paginatedItems.map((item) => (
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

      <DataPagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
      />

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
