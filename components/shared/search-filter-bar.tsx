"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUrlState } from "@/lib/hooks/use-url-state";

export interface SearchFilterBarProps {
  placeholder?: string;
  searchParamKey?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SearchFilterBar({
  placeholder = "Cari kata kunci...",
  searchParamKey = "q",
  className = "",
  children,
}: SearchFilterBarProps) {
  const { getParam, setParam } = useUrlState();
  const currentQuery = getParam(searchParamKey, "");
  const [prevQuery, setPrevQuery] = React.useState(currentQuery);
  const [localValue, setLocalValue] = React.useState(currentQuery);

  // Sync external changes in query param (e.g. navigation back/forward) without triggering cascading renders
  if (prevQuery !== currentQuery) {
    setPrevQuery(currentQuery);
    setLocalValue(currentQuery);
  }

  // Debounce query param update
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== currentQuery) {
        setParam(searchParamKey, localValue, { resetPage: true });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, currentQuery, searchParamKey, setParam]);

  function handleClear() {
    setLocalValue("");
    setParam(searchParamKey, null, { resetPage: true });
  }

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="relative w-full max-w-sm">
        <label htmlFor={`search-${searchParamKey}`} className="sr-only">
          {placeholder}
        </label>
        <Search
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={`search-${searchParamKey}`}
          type="search"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="h-9 pr-8 pl-9 text-sm"
        />
        {localValue ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Bersihkan pencarian"
          >
            <X className="size-3.5" />
          </Button>
        ) : null}
      </div>

      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}
