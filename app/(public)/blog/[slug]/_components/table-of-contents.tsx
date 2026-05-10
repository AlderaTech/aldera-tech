"use client";

import * as React from "react";
import { ListTree } from "lucide-react";
import { cn } from "@/lib/utils";

type Heading = { id: string; text: string; level: number };

/**
 * Reads h2/h3 headings from the rendered article, assigns IDs, and tracks
 * the currently visible heading via IntersectionObserver for scroll spy.
 */
export function TableOfContents({ containerId }: { containerId: string }) {
  const [headings, setHeadings] = React.useState<Heading[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const nodes = Array.from(
      container.querySelectorAll("h2, h3")
    ) as HTMLHeadingElement[];

    const items: Heading[] = nodes.map((node, idx) => {
      if (!node.id) {
        const slug =
          (node.textContent ?? `section-${idx}`)
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "") || `section-${idx}`;
        node.id = `${slug}-${idx}`;
      }
      return {
        id: node.id,
        text: node.textContent ?? "",
        level: node.tagName === "H2" ? 2 : 3,
      };
    });

    // Defer state update to next tick to avoid cascading renders
    const setTimer = setTimeout(() => setHeadings(items), 0);

    if (items.length === 0) {
      return () => clearTimeout(setTimer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop
          );
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0.1 }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => {
      clearTimeout(setTimer);
      observer.disconnect();
    };
  }, [containerId]);

  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="Daftar isi"
      className="sticky top-20 hidden xl:block w-60 shrink-0"
    >
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 inline-flex items-center gap-1.5">
        <ListTree className="size-3.5" />
        Daftar Isi
      </div>
      <ul className="space-y-1 border-l">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                "block py-1 text-sm transition-colors pl-4 -ml-px border-l-2",
                h.level === 3 && "pl-7",
                activeId === h.id
                  ? "text-primary border-primary font-medium"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
