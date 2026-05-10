"use client";

import { useEffect } from "react";
import { incrementBlogViewAction } from "@/lib/actions/blog";

/**
 * Fires once per mount to increment the view counter. Uses sessionStorage
 * to de-dupe within a session (same tab refresh won't double-count).
 */
export function BlogViewIncrementer({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `solvo:viewed:${slug}`;
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    incrementBlogViewAction(slug).catch(() => {});
  }, [slug]);
  return null;
}
