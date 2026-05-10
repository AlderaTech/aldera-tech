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
    <div className="mx-auto w-full max-w-[1080px]">
      <Link
        href={PUBLIC_ROUTES.home}
        className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-black/58 transition-colors hover:text-black"
      >
        <ArrowLeft className="size-4" />
        Kembali ke beranda
      </Link>

      <div className="grid overflow-hidden rounded-xl border border-black/10 bg-white/45 shadow-2xl shadow-black/10 lg:h-[calc(100dvh-4rem)] lg:max-h-[680px] lg:min-h-[560px] lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
        <AuthCard eyebrow={eyebrow} title={title} description={description}>
          {children}
        </AuthCard>
        <AuthSidePanel variant={variant} />
      </div>
    </div>
  );
}
