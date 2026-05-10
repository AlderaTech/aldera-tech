"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  FolderKanban,
  FileText,
  Users,
  Newspaper,
  Loader2,
  Search as SearchIcon,
  LayoutDashboard,
  Plus,
  FileSignature,
  FolderClosed,
  Repeat,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@prisma/client";
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
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import {
  hasPermission,
  isStaff,
  PERMISSIONS,
  type Permission,
} from "@/lib/permissions";

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

type QuickNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
};

const adminQuickNav: QuickNavItem[] = [
  { label: "Dashboard", href: ADMIN_ROUTES.home, icon: LayoutDashboard },
  {
    label: "Proyek",
    href: ADMIN_ROUTES.projects,
    icon: FolderKanban,
    permission: PERMISSIONS.PROJECT_VIEW_ALL,
  },
  {
    label: "Proyek Baru",
    href: ADMIN_ROUTES.projectNew,
    icon: Plus,
    permission: PERMISSIONS.PROJECT_CREATE,
  },
  {
    label: "Proposal",
    href: ADMIN_ROUTES.proposals,
    icon: FileSignature,
    permission: PERMISSIONS.PROPOSAL_MANAGE,
  },
  {
    label: "Proposal Baru",
    href: ADMIN_ROUTES.proposalNew,
    icon: Plus,
    permission: PERMISSIONS.PROPOSAL_MANAGE,
  },
  {
    label: "Invoice",
    href: ADMIN_ROUTES.invoices,
    icon: FileText,
    permission: PERMISSIONS.INVOICE_VIEW,
  },
  {
    label: "Invoice Baru",
    href: ADMIN_ROUTES.invoiceNew,
    icon: Plus,
    permission: PERMISSIONS.INVOICE_CREATE,
  },
  {
    label: "Invoice Berulang",
    href: ADMIN_ROUTES.invoicesRecurring,
    icon: Repeat,
    permission: PERMISSIONS.INVOICE_VIEW,
  },
  {
    label: "Template Invoice Baru",
    href: ADMIN_ROUTES.invoiceRecurringNew,
    icon: Archive,
    permission: PERMISSIONS.INVOICE_CREATE,
  },
  {
    label: "Blog",
    href: ADMIN_ROUTES.blog,
    icon: Newspaper,
    permission: PERMISSIONS.BLOG_VIEW,
  },
  {
    label: "Post Baru",
    href: ADMIN_ROUTES.blogNew,
    icon: Plus,
    permission: PERMISSIONS.BLOG_CREATE,
  },
  {
    label: "File Manager",
    href: ADMIN_ROUTES.files,
    icon: FolderClosed,
    permission: PERMISSIONS.FILE_MANAGE,
  },
  {
    label: "Pengguna",
    href: ADMIN_ROUTES.users,
    icon: Users,
    permission: PERMISSIONS.USER_MANAGE,
  },
  {
    label: "Settings Website",
    href: ADMIN_ROUTES.settings,
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_MANAGE,
  },
  {
    label: "Audit Log",
    href: ADMIN_ROUTES.audit,
    icon: ShieldCheck,
    permission: PERMISSIONS.AUDIT_VIEW,
  },
];

const clientQuickNav: QuickNavItem[] = [
  { label: "Overview", href: DASHBOARD_ROUTES.home, icon: LayoutDashboard },
  {
    label: "Proyek Saya",
    href: DASHBOARD_ROUTES.projects,
    icon: FolderKanban,
  },
  { label: "Invoice", href: DASHBOARD_ROUTES.invoices, icon: FileText },
];

export function CommandPalette({ role }: { role?: Role | null }) {
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

  const quickNav = isStaff(role)
    ? adminQuickNav.filter(
        (item) => !item.permission || hasPermission(role, item.permission)
      )
    : clientQuickNav;

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
