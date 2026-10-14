"use client";

import Link from "next/link";
import { Check, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN_ROUTES } from "@/lib/routes";
import { usePortfolioForm } from "../_hooks/use-portfolio-form";
import { PortfolioGeneralFields } from "./portfolio-general-fields";
import { PortfolioContentFields } from "./portfolio-content-fields";
import { PortfolioMediaFields } from "./portfolio-media-fields";
import type { PortfolioFormInitial } from "../_utils/portfolio-types";

export function PortfolioForm({ initial }: { initial?: PortfolioFormInitial }) {
  const form = usePortfolioForm(initial);

  return (
    <form onSubmit={form.handleSubmit} className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-xs">
          <Link href={ADMIN_ROUTES.portfolio}>
            <ArrowLeft className="size-4" /> Kembali ke Daftar Portfolio
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={form.isPending}
            className="bg-brand-primary hover:bg-brand-primary-hover gap-1.5 text-white"
          >
            {form.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            {form.isEdit ? "Simpan Perubahan" : "Terbitkan Studi Kasus"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <PortfolioGeneralFields form={form} />
          <PortfolioContentFields form={form} />
        </div>
        <div className="space-y-6">
          <PortfolioMediaFields form={form} />
        </div>
      </div>
    </form>
  );
}
