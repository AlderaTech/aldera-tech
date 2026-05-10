export const PUBLIC_ROUTES = {
  home: "/",
  about: "/about",
  services: "/services",
  portfolio: "/portfolio",
  pricing: "/pricing",
  faq: "/faq",
  blog: "/blog",
  testimonials: "/testimonials",
  contact: "/contact",
  blogDetail: (slug: string) => `/blog/${slug}`,
  blogCategory: (slug: string) => `/blog?category=${slug}`,
  blogPage: (params: { page: number; category?: string; q?: string }) => {
    const searchParams = new URLSearchParams({
      ...(params.category ? { category: params.category } : {}),
      ...(params.q ? { q: params.q } : {}),
      page: String(params.page),
    });
    return `/blog?${searchParams.toString()}`;
  },
  portfolioDetail: (slug: string) => `/portfolio/${slug}`,
  contactWithService: (slug: string) => `/contact?service=${slug}`,
  contactWithPlan: (slug: string) => `/contact?plan=${slug}`,
} as const;

export const AUTH_ROUTES = {
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  loginWithCallback: (callbackUrl: string) =>
    `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
} as const;

export const DASHBOARD_ROUTES = {
  home: "/dashboard",
  projects: "/dashboard/projects",
  invoices: "/dashboard/invoices",
  profile: "/dashboard/profile",
  settings: "/dashboard/settings",
  projectDetail: (id: string) => `/dashboard/projects/${id}`,
} as const;

export const ADMIN_ROUTES = {
  home: "/admin",
  audit: "/admin/audit",
  blog: "/admin/blog",
  files: "/admin/files",
  invoices: "/admin/invoices",
  invoiceNew: "/admin/invoices/new",
  invoicesRecurring: "/admin/invoices/recurring",
  projects: "/admin/projects",
  projectNew: "/admin/projects/new",
  proposals: "/admin/proposals",
  proposalNew: "/admin/proposals/new",
  settings: "/admin/settings",
  users: "/admin/users",
  blogEdit: (id: string) => `/admin/blog/${id}/edit`,
  invoiceDetail: (id: string) => `/admin/invoices/${id}`,
  projectDetail: (id: string) => `/admin/projects/${id}`,
  proposalDetail: (id: string) => `/admin/proposals/${id}`,
} as const;
