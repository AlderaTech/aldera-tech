# Panduan Rute & Navigasi Terpusat (Routes & Navigation Guide)

Dokumen ini menjelaskan arsitektur rute terpusat pada **Aldera Tech**, daftar konstanta rute, serta pedoman implementasi di seluruh lapisan aplikasi (Client Components, Server Components, Server Actions, Route Handlers, dan Utilitas).

---

## 1. Filosofi & Alasan Sentralisasi Rute

Menuliskan path URL sebagai string manual (_hardcoded string literal_) seperti `"/admin/invoices"` atau `"/dashboard/projects"` di berbagai komponen rawan terhadap:

1. **Kesalahan Ketik (Typo)**: Misal `"/admin/invoice"` alih-alih `"/admin/invoices"`, atau `"/login?calbackUrl=..."`.
2. **Refactoring Fragile**: Perubahan struktur folder Next.js App Router akan merusak link di banyak tempat tanpa peringatan dari compiler.
3. **Inkonsistensi Akses**: Parameter query tidak terstandarisasi.

Untuk mencegah masalah tersebut, seluruh rute internal aplikasi didaftarkan dan diekspor secara terpusat pada [`lib/routes.ts`](../lib/routes.ts). **Setiap link, tombol navigasi, pemanggilan API internal, pemanggilan `redirect()`, serta `revalidatePath()` WAJIB mengimpor konstanta dari file ini.**

---

## 2. Struktur Pengelompokan Rute (`lib/routes.ts`)

Rute dikelompokkan ke dalam objek konstanta bertipe `as const`:

### A. `PUBLIC_ROUTES`

Rute halaman publik yang dapat diakses oleh semua pengunjung (tamu maupun user login).

```typescript
import { PUBLIC_ROUTES } from "@/lib/routes";

// Rute statis
PUBLIC_ROUTES.home; // "/"
PUBLIC_ROUTES.about; // "/about"
PUBLIC_ROUTES.services; // "/services"
PUBLIC_ROUTES.portfolio; // "/portfolio"
PUBLIC_ROUTES.pricing; // "/pricing"
PUBLIC_ROUTES.faq; // "/faq"
PUBLIC_ROUTES.blog; // "/blog"
PUBLIC_ROUTES.testimonials; // "/testimonials"
PUBLIC_ROUTES.contact; // "/contact"

// Builder rute berparameter
PUBLIC_ROUTES.blogDetail(slug); // "/blog/{slug}"
PUBLIC_ROUTES.blogPost(slug); // "/blog/{slug}" (alias)
PUBLIC_ROUTES.blogCategory(slug); // "/blog?category={slug}"
PUBLIC_ROUTES.blogPage({ page, category, q }); // "/blog?category=...&q=...&page=..."
PUBLIC_ROUTES.portfolioDetail(slug); // "/portfolio/{slug}"
PUBLIC_ROUTES.contactWithService(slug); // "/contact?service={slug}"
PUBLIC_ROUTES.contactWithPlan(slug); // "/contact?plan={slug}"
```

### B. `AUTH_ROUTES`

Rute autentikasi dan manajemen akun pengunjung/klien.

```typescript
import { AUTH_ROUTES } from "@/lib/routes";

AUTH_ROUTES.login; // "/login"
AUTH_ROUTES.register; // "/register"
AUTH_ROUTES.forgotPassword; // "/forgot-password"
AUTH_ROUTES.resetPassword; // "/reset-password"
AUTH_ROUTES.loginWithCallback(callbackUrl); // "/login?callbackUrl={callbackUrl}"
AUTH_ROUTES.resetPasswordWithToken(token); // "/reset-password?token={token}"
```

### C. `DASHBOARD_ROUTES`

Rute portal mandiri klien (_Client Portal_).

```typescript
import { DASHBOARD_ROUTES } from "@/lib/routes";

DASHBOARD_ROUTES.home; // "/dashboard"
DASHBOARD_ROUTES.projects; // "/dashboard/projects"
DASHBOARD_ROUTES.calculator; // "/dashboard/calculator"
DASHBOARD_ROUTES.orders; // "/dashboard/orders"
DASHBOARD_ROUTES.invoices; // "/dashboard/invoices"
DASHBOARD_ROUTES.profile; // "/dashboard/profile"
DASHBOARD_ROUTES.settings; // "/dashboard/settings"
DASHBOARD_ROUTES.projectDetail(id); // "/dashboard/projects/{id}"
```

### D. `ADMIN_ROUTES`

Rute portal manajemen internal untuk tim staff (Admin, PM, Developer, Finance, Marketing).

```typescript
import { ADMIN_ROUTES } from "@/lib/routes";

ADMIN_ROUTES.home; // "/admin"
ADMIN_ROUTES.analytics; // "/admin/analytics"
ADMIN_ROUTES.audit; // "/admin/audit"
ADMIN_ROUTES.blog; // "/admin/blog"
ADMIN_ROUTES.blogCategories; // "/admin/blog/categories"
ADMIN_ROUTES.blogNew; // "/admin/blog/new"
ADMIN_ROUTES.calculator; // "/admin/calculator"
ADMIN_ROUTES.files; // "/admin/files"
ADMIN_ROUTES.invoices; // "/admin/invoices"
ADMIN_ROUTES.invoiceNew; // "/admin/invoices/new"
ADMIN_ROUTES.invoicesRecurring; // "/admin/invoices/recurring"
ADMIN_ROUTES.invoiceRecurringNew; // "/admin/invoices/recurring/new"
ADMIN_ROUTES.orders; // "/admin/orders"
ADMIN_ROUTES.projects; // "/admin/projects"
ADMIN_ROUTES.projectNew; // "/admin/projects/new"
ADMIN_ROUTES.proposals; // "/admin/proposals"
ADMIN_ROUTES.proposalNew; // "/admin/proposals/new"
ADMIN_ROUTES.settings; // "/admin/settings"
ADMIN_ROUTES.team; // "/admin/team"
ADMIN_ROUTES.timesheet; // "/admin/timesheet"
ADMIN_ROUTES.users; // "/admin/users"

// Builder rute detail/edit
ADMIN_ROUTES.blogEdit(id); // "/admin/blog/{id}/edit"
ADMIN_ROUTES.invoiceDetail(id); // "/admin/invoices/{id}"
ADMIN_ROUTES.projectDetail(id); // "/admin/projects/{id}"
ADMIN_ROUTES.proposalDetail(id); // "/admin/proposals/{id}"
```

### E. `PROPOSAL_ROUTES`

Rute publik untuk peninjauan dan penandatanganan proposal penawaran.

```typescript
import { PROPOSAL_ROUTES } from "@/lib/routes";

PROPOSAL_ROUTES.publicDetail(token); // "/proposal/{token}"
```

### F. `API_ROUTES`

Rute endpoint backend API internal.

```typescript
import { API_ROUTES } from "@/lib/routes";

API_ROUTES.exportAnalytics                          // "/api/admin/export/analytics"
API_ROUTES.exportInvoices                           // "/api/admin/export/invoices"
API_ROUTES.exportProjects                           // "/api/admin/export/projects"
API_ROUTES.exportTimesheet                          // "/api/admin/export/timesheet"
API_ROUTES.exportTimesheetWithRange(from, to)       // "/api/admin/export/timesheet?from=...&to=..."
API_ROUTES.invoicePdf(id)                           // "/api/invoices/{id}/pdf"
API_ROUTES.upload                                   // "/api/upload"
API_ROUTES.search(query?)                           // "/api/search?q=..."
API_ROUTES.cronInvoiceReminder                      // "/api/cron/invoice-reminder"
API_ROUTES.cronIssueRecurring                       // "/api/cron/issue-recurring"
API_ROUTES.cronPublishScheduled                     // "/api/cron/publish-scheduled"
```

### G. Unified Namespace `ROUTES`

Anda juga dapat mengimpor objek terpadu `ROUTES` atau default export:

```typescript
import { ROUTES } from "@/lib/routes";

// ROUTES.public.*
// ROUTES.auth.*
// ROUTES.dashboard.*
// ROUTES.admin.*
// ROUTES.proposal.*
// ROUTES.api.*
```

---

## 3. Pedoman & Contoh Penggunaan

### A. Tautan Navigasi (Next.js `<Link>` dan `<Button asChild>`)

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES, DASHBOARD_ROUTES, AUTH_ROUTES } from "@/lib/routes";

// ❌ DILARANG: String hardcoded
<Link href="/dashboard/projects">Proyek Saya</Link>
<Link href="/login?callbackUrl=/dashboard/calculator">Hitung Estimasi</Link>

// ✅ BENAR: Menggunakan konstanta
<Link href={DASHBOARD_ROUTES.projects}>Proyek Saya</Link>
<Link href={AUTH_ROUTES.loginWithCallback(DASHBOARD_ROUTES.calculator)}>
  Hitung Estimasi
</Link>
```

### B. Pengalihan Rute (`redirect()` pada Server Component & Server Action)

```typescript
import { redirect } from "next/navigation";
import { AUTH_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";

// ❌ DILARANG
redirect("/login");
redirect("/dashboard/projects/" + projectId);

// ✅ BENAR
redirect(AUTH_ROUTES.login);
redirect(DASHBOARD_ROUTES.projectDetail(projectId));
```

### C. Pembersihan Cache (`revalidatePath()`)

```typescript
import { revalidatePath } from "next/cache";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";

// ❌ DILARANG
revalidatePath("/admin/invoices");
revalidatePath("/blog/" + post.slug);

// ✅ BENAR
revalidatePath(ADMIN_ROUTES.invoices);
revalidatePath(PUBLIC_ROUTES.blogDetail(post.slug));
```

### D. Pemanggilan API Frontend (`fetch()`)

```typescript
import { API_ROUTES } from "@/lib/routes";

// ❌ DILARANG
const res = await fetch("/api/upload", { method: "POST", body: fd });

// ✅ BENAR
const res = await fetch(API_ROUTES.upload, { method: "POST", body: fd });
```

---

## 4. Aturan Penambahan Rute Baru

Jika Anda membuat halaman atau endpoint API baru:

1. Buka file [`lib/routes.ts`](../lib/routes.ts).
2. Tambahkan rute baru ke grup konstanta yang sesuai (`PUBLIC_ROUTES`, `AUTH_ROUTES`, `DASHBOARD_ROUTES`, `ADMIN_ROUTES`, atau `API_ROUTES`).
3. Gunakan fungsi builder jika rute memerlukan parameter dinamis (misal: `(id: string) => string`).
4. Ekspor rute dan gunakan di komponen yang membutuhkan.
5. Jalankan `bunx tsc --noEmit` untuk memvalidasi ketiadaan galat ketik.
