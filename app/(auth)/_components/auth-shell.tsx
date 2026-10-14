import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PUBLIC_ROUTES } from "@/lib/routes";
import type { AuthVariant } from "../_constants/auth-panel-copy";
import { AuthCard } from "./auth-card";
import { AuthSidePanel } from "./auth-side-panel";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  variant: AuthVariant;
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  variant,
  children,
}: AuthShellProps) {
  return (
    <div className="mx-auto w-full max-w-[1040px]">
      <Link
        href={PUBLIC_ROUTES.home}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-[#0F263A]"
      >
        <ArrowLeft className="size-4" />
        Kembali ke beranda
      </Link>

      <div className="grid overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/10 lg:min-h-[580px] lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
        <AuthCard eyebrow={eyebrow} title={title} description={description}>
          {children}
        </AuthCard>
        <AuthSidePanel variant={variant} />
      </div>
    </div>
  );
}
