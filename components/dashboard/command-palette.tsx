"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  FileText,
  Users,
  Newspaper,
  Loader2,
  Search as SearchIcon,
  LayoutDashboard,
  Plus,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

type SearchResult = {
  kind: "project" | "invoice" | "user" | "blog";
  id: string;
  title: string;
  subtitle?: string | null;
  href: string;
};

const kindIcon = {
  project: FolderKanban,
  invoice: FileText,
  user: Users,
  blog: Newspaper,
};

const kindLabel = {
  project: "Proyek",
  invoice: "Invoice",
  user: "Pengguna",
  blog: "Blog",
};

export function CommandPalette({ isStaff = false }: { isStaff?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  // ⌘K / Ctrl+K global shortcut
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Debounced search
  React.useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (!trimmed) {
      // Defer clearing results so we don't setState during effect mount.
      const clearTimer = setTimeout(() => setResults([]), 0);
      return () => clearTimeout(clearTimer);
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Search failed");
        const data = (await res.json()) as { results: SearchResult[] };
        setResults(data.results);
      } catch {
        // swallow
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query, open]);

  function handleSelect(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const grouped: Partial<Record<SearchResult["kind"], SearchResult[]>> = {};
  for (const r of results) {
    (grouped[r.kind] ??= []).push(r);
  }

  const quickNav = isStaff
    ? [
        { label: "Overview", href: "/admin", icon: LayoutDashboard },
        { label: "Proyek", href: "/admin/projects", icon: FolderKanban },
        { label: "Invoice", href: "/admin/invoices", icon: FileText },
        { label: "Blog", href: "/admin/blog", icon: Newspaper },
        { label: "Pengguna", href: "/admin/users", icon: Users },
        { label: "Proyek Baru", href: "/admin/projects/new", icon: Plus },
        { label: "Invoice Baru", href: "/admin/invoices/new", icon: Plus },
        { label: "Blog Baru", href: "/admin/blog/new", icon: Plus },
      ]
    : [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { label: "Proyek Saya", href: "/dashboard/projects", icon: FolderKanban },
        { label: "Invoice", href: "/dashboard/invoices", icon: FileText },
      ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Cari proyek, invoice, user…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="py-6 text-center text-sm text-muted-foreground inline-flex items-center justify-center gap-2 w-full">
            <Loader2 className="size-4 animate-spin" /> Mencari…
          </div>
        )}
        {!loading && query && results.length === 0 && (
          <CommandEmpty>Tidak ada hasil untuk &ldquo;{query}&rdquo;</CommandEmpty>
        )}

        {!query && (
          <CommandGroup heading="Navigasi Cepat">
            {quickNav.map((n) => (
              <CommandItem
                key={n.href}
                value={n.label}
                onSelect={() => handleSelect(n.href)}
              >
                <n.icon className="size-4" />
                {n.label}
              </CommandItem>
            ))}
            <CommandSeparator />
            <CommandItem disabled className="!opacity-60">
              <SearchIcon className="size-4" />
              Ketik untuk mencari…
              <CommandShortcut>⌘K</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        )}

        {(Object.keys(grouped) as SearchResult["kind"][]).map((kind) => {
          const items = grouped[kind] ?? [];
          if (!items.length) return null;
          const Icon = kindIcon[kind];
          return (
            <CommandGroup key={kind} heading={kindLabel[kind]}>
              {items.map((item) => (
                <CommandItem
                  key={`${kind}-${item.id}`}
                  value={`${item.title} ${item.subtitle ?? ""}`}
                  onSelect={() => handleSelect(item.href)}
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{item.title}</span>
                    {item.subtitle && (
                      <span className="text-xs text-muted-foreground truncate">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
