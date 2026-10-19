/**
 * Sentralisasi seluruh Route Constants di aplikasi Aldera Tech.
 *
 * Seluruh navigasi, tautan Link, router.push, redirect, dan pemanggilan API
 * WAJIB menggunakan konstanta ini untuk meminimalkan typo dan memudahkan refactoring.
 */

export const PUBLIC_ROUTES = {
  home: "/",
  about: "/about",
  services: "/services",
  portfolio: "/portfolio",
  pricing: "/pricing",
  calculator: "/pricing#calculator",
  faq: "/faq",
  blog: "/blog",
  testimonials: "/testimonials",
  contact: "/contact",
  blogDetail: (slug: string) => `/blog/${slug}`,
  blogPost: (slug: string) => `/blog/${slug}`,
  blogCategory: (slug: string) => `/blog?category=${encodeURIComponent(slug)}`,
  blogPage: (params: { page: number; category?: string; q?: string }) => {
    const searchParams = new URLSearchParams({
      ...(params.category ? { category: params.category } : {}),
      ...(params.q ? { q: params.q } : {}),
      page: String(params.page),
    });
    return `/blog?${searchParams.toString()}`;
  },
  portfolioDetail: (slug: string) => `/portfolio/${slug}`,
  contactWithService: (slug: string) =>
    `/contact?service=${encodeURIComponent(slug)}`,
  contactWithPlan: (slug: string) =>
    `/contact?plan=${encodeURIComponent(slug)}`,
  aiRelay: "/ai-relay",
} as const;

export const AUTH_ROUTES = {
  login: "/login",
  register: "/register",
  verifyOtpWithPhone: (phone: string) =>
    `/verify-otp?phone=${encodeURIComponent(phone)}`,
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  loginWithCallback: (callbackUrl: string) =>
    `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
  resetPasswordWithToken: (token: string) =>
    `/reset-password?token=${encodeURIComponent(token)}`,
} as const;

export const DASHBOARD_ROUTES = {
  home: "/dashboard",
  projects: "/dashboard/projects",
  calculator: "/dashboard/calculator",
  orders: "/dashboard/orders",
  invoices: "/dashboard/invoices",
  profile: "/dashboard/profile",
  settings: "/dashboard/settings",
  projectDetail: (id: string) => `/dashboard/projects/${id}`,
  projectDetailTab: (id: string, tab: string) =>
    `/dashboard/projects/${id}?tab=${encodeURIComponent(tab)}`,
  projectsWithParams: (params: {
    q?: string;
    status?: string;
    page?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.status && params.status !== "ALL")
      sp.set("status", params.status);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    const qs = sp.toString();
    return qs ? `/dashboard/projects?${qs}` : "/dashboard/projects";
  },
  invoicesWithParams: (params: { status?: string; page?: number }) => {
    const sp = new URLSearchParams();
    if (params.status && params.status !== "ALL")
      sp.set("status", params.status);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    const qs = sp.toString();
    return qs ? `/dashboard/invoices?${qs}` : "/dashboard/invoices";
  },
  ordersWithParams: (params: { status?: string; page?: number }) => {
    const sp = new URLSearchParams();
    if (params.status && params.status !== "ALL")
      sp.set("status", params.status);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    const qs = sp.toString();
    return qs ? `/dashboard/orders?${qs}` : "/dashboard/orders";
  },
  aiRelay: "/dashboard/ai-relay",
  aiRelayTab: (tab: string) =>
    `/dashboard/ai-relay?tab=${encodeURIComponent(tab)}`,
} as const;

export const PROPOSAL_ROUTES = {
  publicDetail: (token: string) => `/proposal/${token}`,
} as const;

export const ADMIN_ROUTES = {
  home: "/admin",
  analytics: "/admin/analytics",
  audit: "/admin/audit",
  blog: "/admin/blog",
  blogCategories: "/admin/blog/categories",
  blogNew: "/admin/blog/new",
  calculator: "/admin/calculator",
  files: "/admin/files",
  invoices: "/admin/invoices",
  invoiceNew: "/admin/invoices/new",
  invoicesRecurring: "/admin/invoices/recurring",
  invoiceRecurringNew: "/admin/invoices/recurring/new",
  orders: "/admin/orders",
  portfolio: "/admin/portfolio",
  portfolioNew: "/admin/portfolio/new",
  portfolioEdit: (id: string) => `/admin/portfolio/${id}/edit`,
  projects: "/admin/projects",
  projectNew: "/admin/projects/new",
  proposals: "/admin/proposals",
  proposalNew: "/admin/proposals/new",
  settings: "/admin/settings",
  team: "/admin/users?role=DEVELOPER&view=workload",
  testimonials: "/admin/testimonials",
  timesheet: "/admin/timesheet",
  users: "/admin/users",
  blogEdit: (id: string) => `/admin/blog/${id}/edit`,
  invoiceDetail: (id: string) => `/admin/invoices/${id}`,
  projectDetail: (id: string) => `/admin/projects/${id}`,
  projectDetailTab: (id: string, tab: string) =>
    `/admin/projects/${id}?tab=${encodeURIComponent(tab)}`,
  proposalDetail: (id: string) => `/admin/proposals/${id}`,
  settingsTab: (tab: string) =>
    `/admin/settings?tab=${encodeURIComponent(tab)}`,
  telegramBotTab: (tab: string) =>
    `/admin/telegram-bot?tab=${encodeURIComponent(tab)}`,
  aiRelay: "/admin/ai-relay",
  aiRelayTab: (tab: string) => `/admin/ai-relay?tab=${encodeURIComponent(tab)}`,
  telegramBot: "/admin/telegram-bot",
  calculatorTab: (tab: string) =>
    `/admin/calculator?tab=${encodeURIComponent(tab)}`,
  projectsWithParams: (params: {
    q?: string;
    status?: string;
    page?: number;
    sort?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.status && params.status !== "ALL")
      sp.set("status", params.status);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    if (params.sort) sp.set("sort", params.sort);
    const qs = sp.toString();
    return qs ? `/admin/projects?${qs}` : "/admin/projects";
  },
  invoicesWithParams: (params: {
    q?: string;
    status?: string;
    page?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.status && params.status !== "ALL")
      sp.set("status", params.status);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    const qs = sp.toString();
    return qs ? `/admin/invoices?${qs}` : "/admin/invoices";
  },
  ordersWithParams: (params: {
    q?: string;
    status?: string;
    page?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.status && params.status !== "ALL")
      sp.set("status", params.status);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    const qs = sp.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  },
  proposalsWithParams: (params: {
    q?: string;
    status?: string;
    page?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.status && params.status !== "ALL")
      sp.set("status", params.status);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    const qs = sp.toString();
    return qs ? `/admin/proposals?${qs}` : "/admin/proposals";
  },
  blogWithParams: (params: { q?: string; status?: string; page?: number }) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.status && params.status !== "ALL")
      sp.set("status", params.status);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    const qs = sp.toString();
    return qs ? `/admin/blog?${qs}` : "/admin/blog";
  },
  filesWithParams: (params: { q?: string; type?: string; page?: number }) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.type && params.type !== "ALL" && params.type !== "all")
      sp.set("type", params.type);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    const qs = sp.toString();
    return qs ? `/admin/files?${qs}` : "/admin/files";
  },
  auditWithParams: (params: { q?: string; action?: string; page?: number }) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.action && params.action !== "ALL")
      sp.set("action", params.action);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    const qs = sp.toString();
    return qs ? `/admin/audit?${qs}` : "/admin/audit";
  },
  testimonialsWithParams: (params: {
    q?: string;
    status?: string;
    page?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.status && params.status !== "ALL" && params.status !== "all")
      sp.set("status", params.status);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    const qs = sp.toString();
    return qs ? `/admin/testimonials?${qs}` : "/admin/testimonials";
  },
  portfolioWithParams: (params: {
    q?: string;
    status?: string;
    page?: number;
  }) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.status && params.status !== "ALL" && params.status !== "all")
      sp.set("status", params.status);
    if (params.page && params.page > 1) sp.set("page", String(params.page));
    const qs = sp.toString();
    return qs ? `/admin/portfolio?${qs}` : "/admin/portfolio";
  },
} as const;

export const API_ROUTES = {
  exportAnalytics: "/api/admin/export/analytics",
  exportInvoices: "/api/admin/export/invoices",
  exportProjects: "/api/admin/export/projects",
  exportTimesheet: "/api/admin/export/timesheet",
  exportTimesheetWithRange: (from: string, to: string) =>
    `/api/admin/export/timesheet?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  invoicePdf: (id: string) => `/api/invoices/${id}/pdf`,
  paymentWebhook: "/api/webhooks/payment",
  upload: "/api/upload",
  search: (query?: string) =>
    query ? `/api/search?q=${encodeURIComponent(query)}` : "/api/search",
  cronInvoiceReminder: "/api/cron/invoice-reminder",
  cronIssueRecurring: "/api/cron/issue-recurring",
  cronPublishScheduled: "/api/cron/publish-scheduled",
} as const;

/**
 * Unified namespace pengelompokan seluruh rute aplikasi
 */
export const ROUTES = {
  public: PUBLIC_ROUTES,
  auth: AUTH_ROUTES,
  dashboard: DASHBOARD_ROUTES,
  admin: ADMIN_ROUTES,
  proposal: PROPOSAL_ROUTES,
  api: API_ROUTES,
} as const;

export default ROUTES;
