import type { ReactNode } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { PUBLIC_ROUTES } from "@/lib/routes";

type AuthCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
}: AuthCardProps) {
  return (
    <Card className="gap-0 rounded-none border-0 bg-white p-0 shadow-none lg:h-full lg:overflow-y-auto">
      <CardHeader className="space-y-3 p-6 pb-2 sm:p-8 sm:pb-3">
        <Logo size="md" href={PUBLIC_ROUTES.home} />
        <div className="pt-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-slate-50 px-3 py-1 text-xs font-bold tracking-[0.08em] text-[#0F263A] uppercase">
            {eyebrow}
          </div>
          <CardTitle className="mt-3 text-2xl font-extrabold tracking-tight text-balance text-[#0F263A] sm:text-3xl">
            {title}
          </CardTitle>
          <CardDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      {children}
    </Card>
  );
}
