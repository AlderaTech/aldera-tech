"use client";

import * as React from "react";
import Image from "next/image";
import { Plus, X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PortfolioFormReturn } from "../_hooks/use-portfolio-form";

const COMMON_TECH = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS",
  "Prisma ORM",
  "PostgreSQL",
  "Docker",
  "Node.js",
  "GraphQL",
  "Redis",
];

export function PortfolioMediaFields({ form }: { form: PortfolioFormReturn }) {
  const [techInput, setTechInput] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);

  const handleAddTech = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (techInput.trim()) {
      form.addTech(techInput.trim());
      setTechInput("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Gagal mengunggah gambar");
      const data = await res.json();
      form.setFeaturedImage(data.url);
      toast.success("Gambar berhasil diunggah");
    } catch {
      toast.error("Gagal mengunggah gambar thumbnail");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="space-y-5 border p-5 shadow-sm">
      <h3 className="text-base font-semibold text-foreground">
        Media & Teknologi
      </h3>

      {/* Featured Image */}
      <div className="space-y-3">
        <Label htmlFor="featured-image">Thumbnail / Gambar Utama</Label>
        <div className="flex gap-2">
          <Input
            id="featured-image"
            placeholder="/images/portfolio-sample.webp atau URL gambar"
            value={form.featuredImage}
            onChange={(e) => form.setFeaturedImage(e.target.value)}
            className="text-sm"
          />
          <label className="cursor-pointer">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              className="gap-1.5"
              onClick={() =>
                document.getElementById("portfolio-upload-input")?.click()
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
              id="portfolio-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {form.featuredImage && (
          <div className="relative h-40 w-full overflow-hidden rounded-lg border bg-muted/20">
            <Image
              src={form.featuredImage}
              alt="Preview featured image"
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Tech Stack */}
      <div className="space-y-3">
        <Label>Teknologi yang Digunakan (Tech Stack) *</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ketik nama teknologi (cth: Next.js, Redis)..."
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTech();
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleAddTech()}
          >
            <Plus className="mr-1 size-4" /> Tambah
          </Button>
        </div>

        {/* Selected Tech Chips */}
        <div className="flex min-h-8 flex-wrap gap-1.5 rounded-md border bg-muted/20 p-2">
          {form.techStack.length === 0 ? (
            <span className="text-xs text-muted-foreground">
              Belum ada teknologi ditambahkan.
            </span>
          ) : (
            form.techStack.map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="gap-1 px-2 py-1 font-mono text-xs"
              >
                {t}
                <button
                  type="button"
                  onClick={() => form.removeTech(t)}
                  className="rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))
          )}
        </div>

        {/* Quick select recommendations */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            Rekomendasi Cepat:
          </p>
          <div className="flex flex-wrap gap-1">
            {COMMON_TECH.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => form.addTech(t)}
                disabled={form.techStack.includes(t)}
                className="rounded border px-2 py-0.5 text-[11px] transition-colors hover:bg-muted disabled:opacity-40"
              >
                + {t}
              </button>
            ))}
          </div>
        </div>
        {form.errors.techStack && (
          <p className="text-xs text-destructive">{form.errors.techStack}</p>
        )}
      </div>
    </Card>
  );
}
