"use client";

import * as React from "react";
import { Star, MessageSquareQuote, Check, Loader2, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { submitProjectReviewAction } from "@/lib/actions/testimonial";

export type ProjectReviewPromptProps = {
  projectId: string;
  projectTitle: string;
  existingReview?: {
    id: string;
    rating: number;
    content: string;
    clientRole: string | null;
  } | null;
};

export function ProjectReviewPrompt({
  projectId,
  projectTitle,
  existingReview,
}: ProjectReviewPromptProps) {
  const [isEditing, setIsEditing] = React.useState(!existingReview);
  const [rating, setRating] = React.useState(existingReview?.rating ?? 5);
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  const [clientRole, setClientRole] = React.useState(
    existingReview?.clientRole ?? ""
  );
  const [content, setContent] = React.useState(existingReview?.content ?? "");
  const [isPending, startTransition] = React.useTransition();

  const activeRating = hoverRating ?? rating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error(
        "Mohon berikan ulasan singkat mengenai pengalaman kerja sama Anda."
      );
      return;
    }

    const formData = new FormData();
    formData.append("projectId", projectId);
    formData.append("rating", String(rating));
    formData.append("content", content.trim());
    formData.append("clientRole", clientRole.trim());

    startTransition(async () => {
      const result = await submitProjectReviewAction({ ok: false }, formData);
      if (result.ok) {
        toast.success(result.message || "Ulasan berhasil dikirim!");
        setIsEditing(false);
      } else {
        toast.error(result.message || "Gagal mengirim ulasan");
      }
    });
  };

  if (!isEditing && existingReview) {
    return (
      <Card className="border-brand-primary/20 bg-brand-primary/5 shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-brand-primary/10 text-brand-primary rounded-lg p-2">
                <MessageSquareQuote className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  Ulasan Proyek Selesai
                </CardTitle>
                <CardDescription className="text-xs">
                  Terima kasih atas ulasan dan umpan balik yang Anda berikan
                  untuk proyek {projectTitle}.
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-1.5 text-xs"
            >
              <Edit3 className="size-3.5" />
              Edit Ulasan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`size-4 ${
                  star <= existingReview.rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30"
                }`}
              />
            ))}
            <span className="ml-1.5 text-xs font-semibold text-foreground">
              {existingReview.rating} / 5 Bintang
            </span>
            {existingReview.clientRole && (
              <span className="text-xs text-muted-foreground">
                • {existingReview.clientRole}
              </span>
            )}
          </div>
          <p className="text-sm text-foreground/90 italic">
            &ldquo;{existingReview.content}&rdquo;
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-brand-primary/30 bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-brand-primary/10 text-brand-primary rounded-lg p-2">
            <MessageSquareQuote className="size-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              Selamat! Proyek Telah Selesai Dikerjakan
            </CardTitle>
            <CardDescription className="text-xs">
              Bagaimana pengalaman Anda bekerja sama dengan tim Aldera Tech?
              Masukan Anda sangat berarti bagi kami.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Beri Rating Anda *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="rounded-sm p-1 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <Star
                    className={`size-6 ${
                      star <= activeRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-semibold text-foreground">
                {activeRating} dari 5 Bintang
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clientRole" className="text-xs font-medium">
              Peran atau Jabatan Anda (Opsional)
            </Label>
            <Input
              id="clientRole"
              placeholder="Cth: Founder & CEO, Product Manager"
              value={clientRole}
              onChange={(e) => setClientRole(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reviewContent" className="text-xs font-medium">
              Ulasan Pengalaman Kerja Sama *
            </Label>
            <Textarea
              id="reviewContent"
              placeholder="Ceritakan kepuasan Anda mengenai kecepatan delivery, kualitas arsitektur kode, komunikasi tim, atau solusi yang kami hadirkan..."
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="text-sm"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            {existingReview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isPending}
              >
                Batal
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="bg-brand-primary hover:bg-brand-primary-hover gap-1.5 text-white"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              {existingReview ? "Perbarui Ulasan" : "Kirim Ulasan Proyek"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
