import type { ReactNode } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="gap-0 rounded-none border-0 bg-white/88 p-0 shadow-none lg:h-full lg:overflow-y-auto">
      <CardHeader className="space-y-3 p-5 pb-3 sm:p-6 sm:pb-3">
        <Logo size="md" href={PUBLIC_ROUTES.home} />
        <div>
          <div className="editorial-kicker border-black/20 text-black/60">
            {eyebrow}
          </div>
          <CardTitle className="editorial-display mt-4 text-3xl text-balance text-black sm:text-4xl">
            {title}
          </CardTitle>
          <CardDescription className="mt-3 text-sm leading-relaxed text-black/60">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      {children}
    </Card>
  );
}
