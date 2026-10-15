"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteTestimonialAction } from "@/lib/actions/testimonial";

import { TestimonialStatGrid } from "./testimonial-stat-grid";
import { TestimonialTable } from "./testimonial-table";
import { TestimonialFormDialog } from "./testimonial-form-dialog";
import { DeleteTestimonialDialog } from "./delete-testimonial-dialog";
import type {
  TestimonialItem,
  CompletedProjectOption,
} from "../_utils/testimonial-types";

export function TestimonialManagement({
  testimonials,
  completedProjects,
}: {
  testimonials: TestimonialItem[];
  completedProjects: CompletedProjectOption[];
}) {
  const router = useRouter();

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<TestimonialItem | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] =
    React.useState<TestimonialItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: TestimonialItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDelete = (item: TestimonialItem) => {
    setDeleteTarget(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteTestimonialAction(deleteTarget.id);
      if (res.ok) {
        toast.success(res.message || "Testimoni berhasil dihapus.");
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(res.message || "Gagal menghapus testimoni.");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem saat menghapus testimoni.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingItem(null);
    router.refresh();
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Testimoni Klien</h1>
          <p className="text-sm text-muted-foreground">
            Kelola ulasan, testimoni proyek, dan rating kepuasan klien Aldera Tech.
          </p>
        </div>
        <Button onClick={handleCreate} className="cursor-pointer gap-2">
          <Plus className="size-4" /> Tambah Testimoni
        </Button>
      </div>

      {/* Metrics Stat Grid */}
      <TestimonialStatGrid items={testimonials} />

      {/* Testimonials Table Card */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
        <TestimonialTable
          items={testimonials}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
        />
      </Card>

      {/* Create / Edit Dialog */}
      <TestimonialFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingItem(null);
        }}
        testimonial={editingItem}
        completedProjects={completedProjects}
        onSuccess={handleFormSuccess}
      />

      {/* Custom AlertDialog Delete Confirmation (NO native browser confirm or alert) */}
      <DeleteTestimonialDialog
        open={Boolean(deleteTarget)}
        clientName={deleteTarget?.clientName || ""}
        isPending={isDeleting}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
