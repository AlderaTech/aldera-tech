import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminStatCardProps = {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  helper?: string;
  toneClassName?: string;
};

export function AdminStatCard({
  icon: Icon,
  label,
  value,
  helper,
  toneClassName = "text-primary bg-primary/10 border-primary/20",
}: AdminStatCardProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-lg border",
              toneClassName
            )}
          >
            <Icon className="size-5" />
          </div>
          <ArrowUpRight className="size-4 text-slate-300" />
        </div>
        <div className="mt-4 space-y-1">
          <div className="text-xs font-medium tracking-[0.12em] text-slate-500 uppercase">
            {label}
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-950 xxxl:text-3xl">
            {value}
          </div>
          {helper && <p className="text-xs text-slate-500">{helper}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
