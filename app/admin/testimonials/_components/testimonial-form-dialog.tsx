"use client";

import * as React from "react";
import Image from "next/image";
import { Star, Upload, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createTestimonialAction,
  updateTestimonialAction,
} from "@/lib/actions/testimonial";
import type {
  TestimonialItem,
  CompletedProjectOption,
} from "../_utils/testimonial-types";

function TestimonialFormBody({
  testimonial,
  completedProjects,
  onOpenChange,
  onSuccess,
}: {
  testimonial: TestimonialItem | null;
  completedProjects: CompletedProjectOption[];
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = React.useTransition();
  const [isUploading, setIsUploading] = React.useState(false);

  const [clientName, setClientName] = React.useState(
    testimonial?.clientName ?? ""
  );
  const [clientRole, setClientRole] = React.useState(
    testimonial?.clientRole ?? ""
  );
  const [content, setContent] = React.useState(testimonial?.content ?? "");
  const [rating, setRating] = React.useState(testimonial?.rating ?? 5);
  const [avatar, setAvatar] = React.useState(testimonial?.avatar ?? "");
  const [projectId, setProjectId] = React.useState(
    testimonial?.projectId ?? ""
  );
  const [published, setPublished] = React.useState(
    testimonial?.published ?? true
  );
  const [order, setOrder] = React.useState(testimonial?.order ?? 0);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Gagal mengunggah avatar");
      const data = await res.json();
      setAvatar(data.url);
      toast.success("Foto avatar berhasil diunggah");
    } catch {
      toast.error("Gagal mengunggah foto avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData();
    formData.append("clientName", clientName);
    formData.append("clientRole", clientRole);
    formData.append("content", content);
    formData.append("rating", String(rating));
    formData.append("avatar", avatar);
    formData.append("projectId", projectId === "none" ? "" : projectId);
    formData.append("published", String(published));
    formData.append("order", String(order));

    startTransition(async () => {
      const res = testimonial
        ? await updateTestimonialAction(testimonial.id, { ok: false }, formData)
        : await createTestimonialAction({ ok: false }, formData);

      if (!res.ok) {
        if (res.errors) setErrors(res.errors);
        toast.error(res.message || "Gagal menyimpan testimoni");
      } else {
        toast.success(res.message || "Testimoni berhasil disimpan");
        onOpenChange(false);
        onSuccess();
      }
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {testimonial ? "Edit Testimoni" : "Tambah Testimoni Baru"}
        </DialogTitle>
        <DialogDescription>
          {testimonial
            ? "Perbarui ulasan, rating, atau status publikasi testimoni."
            : "Masukkan testimoni atau ulasan klien baru ke sistem."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {/* Rating picker */}
        <div className="space-y-1.5">
          <Label>Rating Bintang *</Label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`size-6 ${
                    star <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm font-semibold text-foreground">
              {rating} dari 5 Bintang
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="clientName">Nama Klien *</Label>
            <Input
              id="clientName"
              placeholder="Cth: Budi Santoso"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            {errors.clientName && (
              <p className="text-xs text-destructive">{errors.clientName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clientRole">Peran / Jabatan</Label>
            <Input
              id="clientRole"
              placeholder="Cth: CTO, FinSmart Digital"
              value={clientRole}
              onChange={(e) => setClientRole(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="content">Ulasan / Testimoni *</Label>
          <Textarea
            id="content"
            placeholder="Tulis ulasan klien mengenai kualitas delivery, komunikasi, dan teknologi..."
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {errors.content && (
            <p className="text-xs text-destructive">{errors.content}</p>
          )}
        </div>

        {/* Link to project */}
        <div className="space-y-1.5">
          <Label>Hubungkan dengan Proyek (Opsional)</Label>
          <Select value={projectId || "none"} onValueChange={setProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih proyek yang terkait..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                -- Tidak Terikat Proyek Tertentu --
              </SelectItem>
              {completedProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title} {p.clientName ? `(${p.clientName})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Avatar URL or Upload */}
        <div className="space-y-2">
          <Label htmlFor="avatar-url">Foto Avatar (Opsional)</Label>
          <div className="flex gap-2">
            <Input
              id="avatar-url"
              placeholder="URL avatar atau upload"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
            <label className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                className="gap-1.5"
                onClick={() =>
                  document.getElementById("testimonial-avatar-upload")?.click()
                }
              >
                {isUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                Upload
              </Button>
              <input
                id="testimonial-avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </label>
          </div>
          {avatar && (
            <div className="flex items-center gap-2 pt-1">
              <div className="relative size-10 overflow-hidden rounded-full border">
                <Image
                  src={avatar}
                  alt="Avatar preview"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xs text-muted-foreground">
                Preview Avatar
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3">
            <div>
              <Label
                htmlFor="testi-publish"
                className="cursor-pointer text-xs font-medium"
              >
                Tampilkan di Website
              </Label>
            </div>
            <Switch
              id="testi-publish"
              checked={published}
              onCheckedChange={setPublished}
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border bg-muted/20 p-2.5">
            <Label htmlFor="testi-order" className="text-xs whitespace-nowrap">
              Urutan:
            </Label>
            <Input
              id="testi-order"
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className="h-8"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            disabled={isPending || isUploading}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isPending || isUploading}
            className="bg-brand-primary hover:bg-brand-primary-hover gap-1.5 text-white"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            {testimonial ? "Simpan Perubahan" : "Tambah Testimoni"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function TestimonialFormDialog({
  open,
  onOpenChange,
  testimonial,
  completedProjects,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial: TestimonialItem | null;
  completedProjects: CompletedProjectOption[];
  onSuccess: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        {open && (
          <TestimonialFormBody
            key={testimonial?.id ?? "new"}
            testimonial={testimonial}
            completedProjects={completedProjects}
            onOpenChange={onOpenChange}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
