"use client";

import { useUrlState } from "@/lib/hooks/use-url-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ParamFilterOption {
  label: string;
  value: string;
}

export interface ParamFilterSelectProps {
  paramKey: string;
  options: ParamFilterOption[];
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  ariaLabel?: string;
}

export function ParamFilterSelect({
  paramKey,
  options,
  placeholder = "Filter...",
  defaultValue = "ALL",
  className = "w-[160px] h-9 text-xs",
  ariaLabel,
}: ParamFilterSelectProps) {
  const { getParam, setParam } = useUrlState();
  const currentValue = getParam(paramKey, defaultValue);

  return (
    <Select
      value={currentValue}
      onValueChange={(val) => {
        setParam(
          paramKey,
          val === defaultValue || val.toUpperCase() === "ALL" ? null : val,
          {
            resetPage: true,
          }
        );
      }}
    >
      <SelectTrigger
        className={className}
        aria-label={ariaLabel || placeholder}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
