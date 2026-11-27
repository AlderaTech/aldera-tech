"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  Bot,
  FolderKanban,
  FileText,
  Users,
  Newspaper,
  Loader2,
  LayoutDashboard,
  Plus,
  FileSignature,
  FolderClosed,
  Receipt,
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
} from "@/components/ui/command";
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";
import {
  useCommandSearch,
  type SearchResult,
} from "./_hooks/use-command-search";
import {
  hasPermission,
  isStaff,
  PERMISSIONS,
  type Permission,
} from "@/lib/permissions";

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
    label: "Manajer Berkas",
    href: ADMIN_ROUTES.files,
    icon: FolderClosed,
    permission: PERMISSIONS.FILE_MANAGE,
  },
  {
    label: "Pengguna & Tim",
    href: ADMIN_ROUTES.users,
    icon: Users,
    permission: PERMISSIONS.TEAM_VIEW,
  },
  {
    label: "Settings Website",
    href: ADMIN_ROUTES.settings,
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_MANAGE,
  },
  {
    label: "AI Gateway / Relay Ops",
    href: ADMIN_ROUTES.aiRelay,
    icon: Bot,
    permission: PERMISSIONS.AI_RELAY_MANAGE,
  },
  {
    label: "Audit Log",
    href: ADMIN_ROUTES.audit,
    icon: ShieldCheck,
    permission: PERMISSIONS.AUDIT_VIEW,
  },
];

const clientQuickNav: QuickNavItem[] = [
  { label: "Ringkasan", href: DASHBOARD_ROUTES.home, icon: LayoutDashboard },
  {
    label: "Proyek Saya",
    href: DASHBOARD_ROUTES.projects,
    icon: FolderKanban,
  },
  {
    label: "Pesanan & Estimasi",
    href: DASHBOARD_ROUTES.orders,
    icon: Receipt,
  },
  { label: "Invoice", href: DASHBOARD_ROUTES.invoices, icon: FileText },
  {
    label: "AI Gateway / Relay",
    href: DASHBOARD_ROUTES.aiRelay,
    icon: Bot,
  },
];

export function CommandPalette({ role }: { role?: Role | null }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const { results, loading, error, retry } = useCommandSearch(query, open);

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
          <div className="inline-flex w-full items-center justify-center gap-2 py-6 text-center text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Mencari…
          </div>
        )}
        {!loading && error && (
          <div
            role="alert"
            className="space-y-3 px-4 py-6 text-center text-sm text-muted-foreground"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={retry}
              className="rounded-lg border px-3 py-2 font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Coba lagi
            </button>
          </div>
        )}
        {!loading && !error && query && results.length === 0 && (
          <CommandEmpty>
            Tidak ada hasil untuk &ldquo;{query}&rdquo;
          </CommandEmpty>
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
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{item.title}</span>
                    {item.subtitle && (
                      <span className="truncate text-xs text-muted-foreground">
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
