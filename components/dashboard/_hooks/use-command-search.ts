"use client";

import { useEffect, useState } from "react";
import { API_ROUTES } from "@/lib/routes";
import { toast } from "sonner";

export type SearchResult = {
  kind: "project" | "invoice" | "user" | "blog";
  id: string;
  title: string;
  subtitle?: string | null;
  href: string;
};

export function useCommandSearch(query: string, open: boolean) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    const controller = new AbortController();
    const timer = setTimeout(
      async () => {
        setResults([]);
        setError(null);
        if (!trimmed) {
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          const response = await fetch(API_ROUTES.search(trimmed), {
            signal: controller.signal,
          });
          if (!response.ok) throw new Error("Search unavailable");
          const data: { results: SearchResult[] } = await response.json();
          if (!controller.signal.aborted) setResults(data.results);
        } catch {
          if (!controller.signal.aborted) {
            setError("Pencarian belum tersedia. Silakan coba kembali.");
            toast.error("Pencarian belum tersedia. Silakan coba kembali.", {
              id: "command-search-error",
            });
          }
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      },
      trimmed ? 200 : 0
    );
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, open, attempt]);

  return {
    results,
    loading,
    error,
    retry: () => setAttempt((value) => value + 1),
  };
}
