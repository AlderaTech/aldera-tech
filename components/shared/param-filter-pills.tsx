"use client";

import { useUrlState } from "@/lib/hooks/use-url-state";
import { Button } from "@/components/ui/button";

export interface ParamFilterPillOption {
  label: string;
  value: string;
  count?: number;
}

export interface ParamFilterPillsProps {
  paramKey: string;
  options: ParamFilterPillOption[];
  defaultValue?: string;
  className?: string;
}

export function ParamFilterPills({
  paramKey,
  options,
  defaultValue = "ALL",
  className = "",
}: ParamFilterPillsProps) {
  const { getParam, setParam } = useUrlState();
  const current = getParam(paramKey, defaultValue);

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 ${className}`}
      role="group"
      aria-label={`Filter ${paramKey}`}
    >
      {options.map((opt) => {
        const isActive = current.toUpperCase() === opt.value.toUpperCase();
        return (
          <Button
            key={opt.value}
            type="button"
            size="sm"
            variant={isActive ? "default" : "outline"}
            className="h-8 text-xs"
            onClick={() => {
              setParam(
                paramKey,
                opt.value.toUpperCase() === defaultValue.toUpperCase()
                  ? null
                  : opt.value,
                { resetPage: true }
              );
            }}
          >
            {opt.label}
            {typeof opt.count === "number" ? ` (${opt.count})` : null}
          </Button>
        );
      })}
    </div>
  );
}
