"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export interface UseUrlStateOptions {
  resetPage?: boolean;
}

export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const hookSearchParams = useSearchParams();
  const searchParams =
    (typeof globalThis !== "undefined" &&
      (globalThis as unknown as { __mockSearchParams?: URLSearchParams })
        .__mockSearchParams) ||
    hookSearchParams;
  const [isPending, startTransition] = useTransition();

  const getParam = useCallback(
    (name: string, fallback: string = ""): string => {
      return searchParams?.get(name) ?? fallback;
    },
    [searchParams]
  );

  const setParam = useCallback(
    (
      name: string,
      value: string | number | null | undefined,
      options?: UseUrlStateOptions
    ) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      const stringValue =
        value !== null && value !== undefined ? String(value).trim() : "";

      if (stringValue === "" || stringValue.toLowerCase() === "all") {
        params.delete(name);
      } else {
        params.set(name, stringValue);
      }

      if (options?.resetPage && name !== "page") {
        params.delete("page");
      }

      const queryString = params.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const setParams = useCallback(
    (
      updates: Record<string, string | number | null | undefined>,
      options?: UseUrlStateOptions
    ) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");

      Object.entries(updates).forEach(([key, val]) => {
        const stringValue =
          val !== null && val !== undefined ? String(val).trim() : "";
        if (stringValue === "" || stringValue.toLowerCase() === "all") {
          params.delete(key);
        } else {
          params.set(key, stringValue);
        }
      });

      if (options?.resetPage && !("page" in updates)) {
        params.delete("page");
      }

      const queryString = params.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  return {
    searchParams,
    getParam,
    setParam,
    setParams,
    isPending,
  };
}
