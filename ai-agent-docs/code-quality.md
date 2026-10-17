# Standar Kualitas Kode & Arsitektur Modular (Code Quality Standards)

Dokumen ini merupakan panduan arsitektur dan kualitas kode resmi untuk repositori **Aldera Tech**. Seluruh AI Agent dan pengembang **WAJIB** mematuhi 18 prinsip berikut saat menulis, memodifikasi, atau merefaktor kode.

---

## Daftar Isi

1. [Larangan Fat Files (Anti-Fat Files Rule)](#1-larangan-fat-files-anti-fat-files-rule)
2. [Reusabilitas Kode (Reusable Components & Hooks)](#2-reusabilitas-kode-reusable-components--hooks)
3. [Pemisahan Logic dari UI (Separation of Concerns)](#3-pemisahan-logic-dari-ui-separation-of-concerns)
4. [Batas Ukuran File (LOC Threshold ~200–250 Baris)](#4-batas-ukuran-file-loc-threshold-200250-baris)
5. [Standarisasi Pola Co-location Direktori Fitur](#5-standarisasi-pola-co-location-direktori-fitur)
6. [Kebijakan Zero-any & Strict Type Safety](#6-kebijakan-zero-any--strict-type-safety)
7. [Sentralisasi Validasi Data (Zod Schema Isolation)](#7-sentralisasi-validasi-data-zod-schema-isolation)
8. [Clean Server-to-Client Boundary (RSC vs RCC)](#8-clean-server-to-client-boundary-rsc-vs-rcc)
9. [Standarisasi Penanganan Error & User Feedback](#9-standarisasi-penanganan-error--user-feedback)
10. [Disiplin Styling Tailwind & Semantic Design Tokens](#10-disiplin-styling-tailwind--semantic-design-tokens)
11. [Efisiensi State & Eliminasi Redundant useEffect](#11-efisiensi-state--eliminasi-redundant-useeffect)
12. [Konvensi Penamaan Terstandarisasi (Naming Conventions)](#12-konvensi-penamaan-terstandarisasi-naming-conventions)
13. [Sentralisasi Rute & Anti-Hardcoded Navigation (Zero Hardcoded Routes)](#13-sentralisasi-rute--anti-hardcoded-navigation-zero-hardcoded-routes)
14. [Sinkronisasi State ke URL Parameters (Shareable Deep-Linking)](#14-sinkronisasi-state-ke-url-parameters-shareable-deep-linking)
15. [Standar Penanganan 4 UI States & Input Form Hygiene](#15-standar-penanganan-4-ui-states--input-form-hygiene)
16. [Integritas Pengetesan & Sinkronisasi Test Suite (Test Mapping & Maintenance)](#16-integritas-pengetesan--sinkronisasi-test-suite-test-mapping--maintenance)
17. [Disiplin Git Branching & Squash Merge (No Direct Commit to Main)](#17-disiplin-git-branching--squash-merge-no-direct-commit-to-main)
18. [Kewajiban Pengujian UI untuk Setiap Komponen & Halaman (Mandatory UI Testing)](#18-kewajiban-pengujian-ui-untuk-setiap-komponen--halaman-mandatory-ui-testing)

---

## 1. Larangan Fat Files (Anti-Fat Files Rule)

### Prinsip

Dilarang menumpuk banyak tanggung jawab (sub-view, modal, tabs, form fields, logic kalkulasi) dalam satu file raksasa (_fat file/monolithic file_).

### Aturan

- Jika sebuah file mulai menangani lebih dari satu domain atau memiliki bagian UI yang berdiri sendiri (misal: tab content, modal dialog, action bar), bagian tersebut **wajib diekstrak** menjadi file komponen terpisah.
- `page.tsx` pada Next.js App Router harus ramping: hanya bertugas memuat data (RSC) atau mengotentikasi rute, lalu mendelegasikan rendering ke komponen presentasi utama.

```tsx
// ❌ HINDARI: Menyatukan 4 tab kompleks dan form modal dalam 1 file 400+ baris
export function DashboardAdmin() {
  return (
    <Tabs>
      <TabsContent value="users">{/* 150 baris UI & logic user */}</TabsContent>
      <TabsContent value="orders">
        {/* 150 baris UI & logic order */}
      </TabsContent>
    </Tabs>
  );
}

// ✅ REKOMENDASI: Pecah masing-masing tab ke file tersendiri
// app/admin/_components/users-tab.tsx
// app/admin/_components/orders-tab.tsx
export function DashboardAdmin() {
  return (
    <Tabs>
      <TabsContent value="users">
        <UsersTab />
      </TabsContent>
      <TabsContent value="orders">
        <OrdersTab />
      </TabsContent>
    </Tabs>
  );
}
```

---

## 2. Reusabilitas Kode (Reusable Components & Hooks)

### Prinsip

Terapkan prinsip **DRY (Don't Repeat Yourself)** secara bijak. Komponen, hook, atau fungsi pembantu yang digunakan di lebih dari satu tempat harus dirancang modular dan dapat digunakan kembali.

### Aturan

- **Reusable Component**: Harus menerima `className` opsional yang digabungkan via `cn()`, mendukung `children` jika membungkus elemen, dan menerima props varian yang fleksibel.
- **Custom Hook**: Logika perilaku interaktif berulang (misal: visibilitas password, pagination state, debounced value, modal state) harus diisolasi ke dalam custom hook.
- **Shared Helpers**: Logika manipulasi data (format mata uang, format tanggal, slugify) ditempatkan di `lib/utils.ts` atau modul domain di `lib/`.

---

## 3. Pemisahan Logic dari UI (Separation of Concerns)

### Prinsip

Komponen UI bertanggung jawab untuk **rendering visual dan styling** (JSX + Tailwind). Logika bisnis, pengelolaan state, transisi, dan pemanggilan server action harus dipisahkan ke dalam **Custom Hook** atau **Data Layer**.

### Aturan

- **Custom Hook Pattern**: Ekstrak kumpulan `useState`, `useTransition`, `useEffect`, handler submit form, dan toast ke custom hook di folder `_hooks/` (contoh acuan: `app/admin/blog/_hooks/use-blog-form.ts`).
- Komponen UI cukup memanggil custom hook tersebut dan mengaitkan props yang dikembalikan ke elemen JSX.

```tsx
// ❌ HINDARI: Menumpuk 15 state, timers, dan mutation handlers di dalam file UI
export function ProjectEditForm() {
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();
  // ... puluhan baris logic ...
  return <form>...</form>;
}

// ✅ REKOMENDASI: Ekstrak logic ke custom hook
// app/admin/projects/[id]/_hooks/use-project-edit.ts
export function useProjectEdit(initialData) {
  // seluruh state, form validation, submit transition di sini
  return { formState, isPending, handleSubmit, ... };
}

// app/admin/projects/[id]/_components/project-edit-form.tsx
export function ProjectEditForm({ initialData }) {
  const { formState, isPending, handleSubmit } = useProjectEdit(initialData);
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 4. Batas Ukuran File (LOC Threshold ~200–250 Baris)

### Prinsip

File yang terlalu panjang sulit dibaca, memicu konflik merge, dan meningkatkan risiko regresi.

### Aturan

- **Batas Lunak**: Maksimal **~200–250 baris kode (LOC)** untuk file komponen UI (`.tsx`).
- Jika file mendekati atau melebihi 250 baris, lakukan audit refaktor:
  1. Apakah ada sub-view atau kartu UI yang bisa diekstrak ke `_components/`?
  2. Apakah ada state/form handler yang bisa diekstrak ke `_hooks/`?
  3. Apakah ada kalkulasi data / type definitions yang bisa diekstrak ke `_data/` atau `_utils/`?

---

## 5. Standarisasi Pola Co-location Direktori Fitur

### Prinsip

Letakkan aset dan dependensi sedekat mungkin dengan fitur yang menggunakannya (_Co-location Architecture_).

### Standar Struktur Direktori Per Rute:

```
app/admin/invoices/
├── page.tsx                     # Entry point (RSC): otentikasi & data query
├── _data/
│   └── invoice-detail.ts        # Query Prisma & data formatting khusus fitur
├── _components/
│   ├── invoice-table.tsx        # Sub-komponen UI tabel
│   ├── invoice-create-form.tsx  # Sub-komponen UI form
│   └── row-actions.tsx          # Sub-komponen tombol aksi baris
├── _hooks/
│   └── use-invoice-filter.ts    # Custom hook logika filter & pencarian
└── _utils/
    └── invoice-calc.ts          # Helper kalkulasi khusus invoice
```

### Aturan Penempatan Komponen:

- **Komponen Lokal Fitur**: Masukkan ke `app/.../_components/` rute terkait.
- **Komponen Global Aplikasi**: Masukkan ke `components/shared/` (misal: `logo.tsx`) atau `components/ui/` (elemen primitif Radix/Shadcn).
- Gunakan awalan garis bawah (`_`) untuk folder internal rute agar Next.js App Router tidak menganggapnya sebagai rute URL.

---

## 6. Kebijakan Zero-any & Strict Type Safety

### Prinsip

TypeScript harus memberikan jaminan tipe data saat kompilasi. Penggunaan `any` menghilangkan jaminan tersebut dan menyembunyikan runtime bug.

### Aturan

- **Dilarang Keras** menggunakan tipe `any` (`// @ts-ignore` atau `as any`).
- Jika tipe data belum pasti (misal: parsing JSON atau dynamic payload), gunakan `unknown` lalu lakukan validasi (_type narrowing / guard_) atau validasi skema Zod.
- Gunakan tipe yang diekspor dari `@prisma/client` untuk model basis data, dan ubah tipe `Prisma.Decimal` ke tipe `number` sebelum dikirimkan ke Client Components.

---

## 7. Sentralisasi Validasi Data (Zod Schema Isolation)

### Prinsip

Validasi input tidak boleh dilakukan secara ad-hoc atau tersebar secara manual di dalam event handler komponen UI.

### Aturan

- Seluruh skema validasi wajib dipusatkan di dalam direktori `lib/validations/` (contoh: `lib/validations/project.ts`, `lib/validations/invoice.ts`).
- Server Actions dan form handler wajib memvalidasi payload menggunakan method `.safeParse()` dari skema Zod terkait.
- Manfaatkan inferensi tipe otomatis:
  ```ts
  export type ProjectInput = z.infer<typeof projectSchema>;
  ```

---

## 8. Clean Server-to-Client Boundary (RSC vs RCC)

### Prinsip

Manfaatkan kapabilitas Next.js React Server Components (RSC) secara maksimal untuk performa optimal dan ukuran bundle klien yang minimal.

### Aturan

- **Default ke Server Component**: Komponen adalah Server Component kecuali jika secara eksplisit membutuhkan interaktivitas pengguna (`useState`, `useEffect`, `onClick`, browser APIs).
- **Letak Direktif `"use client"`**: Tempatkan direktif `"use client"` sedalam mungkin di pohon komponen (_leaf components_), bukan di level halaman teratas jika tidak diperlukan.
- **Serialisasi Data Plain Object**: Next.js RSC boundary hanya mengizinkan _plain JSON-serializable objects_. Jangan pernah mengoper instance class (seperti `Prisma.Decimal`) langsung ke Client Component. Konversikan terlebih dahulu menggunakan `Number(...)` atau `String(...)`.

---

## 9. Standarisasi Penanganan Error & User Feedback

### Prinsip

Pengguna tidak boleh dibiarkan tanpa kepastian ketika suatu proses berhasil atau gagal (_no silent failures_).

### Aturan

- **Standardized Server Action Return**: Kembalikan format respons yang konsisten, contoh:
  ```ts
  type ActionResponse<T = unknown> =
    { ok: true; data?: T } | { ok: false; error: string };
  ```
- **Toast Feedback**: Setiap mutasi (tambah, edit, hapus, upload) wajib memicu notifikasi toast via `toast.success("...")` atau `toast.error("...")` dari library Sonner.
- **Larangan Empty Catch**: Dilarang membuat blok `catch (error) {}` kosong yang menelan kesalahan tanpa logging atau notifikasi.
- **Safe Server Rendering**: Query Prisma pada Server Component wajib dibungkus dengan wrapper `safeDb(...)` dari `lib/safe-db.ts` agar gangguan database sementara tidak merusak seluruh halaman.

---

## 10. Disiplin Styling Tailwind & Semantic Design Tokens

### Prinsip

Gaya visual harus konsisten, mudah dipelihara, dan mendukung tema warna tanpa konflik kelas CSS.

### Aturan

- **Class Merging via `cn(...)`**: Selalu gunakan fungsi `cn(...)` dari [`lib/utils.ts`](../lib/utils.ts) saat menggabungkan kelas Tailwind kondisional:
  ```tsx
  // ✅ BENAR
  <div className={cn("base-class", isActive && "active-class", className)} />
  ```
- **Dilarang Inline Style**: Hindari atribut `style={{ ... }}` kecuali untuk properti dinamis tak terbatas (seperti koordinat CSS absolut atau persentase animasi kustom).
- **Gunakan Semantic Design Tokens**:
  - Gunakan `bg-background`, `bg-card`, `bg-muted`, `bg-primary`.
  - Gunakan `text-foreground`, `text-muted-foreground`, `text-primary`.
  - Gunakan `border-border`, `ring-ring`.
  - Hindari penggunaan warna heksadesimal statis (seperti `#0f172a` atau `#ffffff`) agar tema konsisten.

---

## 11. Efisiensi State & Eliminasi Redundant useEffect

### Prinsip

State harus minimal dan dapat diprediksi. Jangan menduplikasi data yang bisa dihitung secara langsung.

### Aturan

- **Hitung Langsung (Derived State)**: Jangan gunakan `useEffect` untuk memperbarui state saat prop/state lain berubah. Hitung langsung nilai tersebut di badan fungsi render atau gunakan `useMemo` jika komputasinya berat.
  ```tsx
  // ❌ HINDARI
  const [total, setTotal] = useState(0);
  useEffect(() => {
    setTotal(price * qty);
  }, [price, qty]);

  // ✅ BENAR
  const total = price * qty;
  ```
- **Gunakan `useTransition`**: Manfaatkan React 19 / Next.js `useTransition()` untuk mengelola status mutasi asinkron dan tombol loading (`pending`), daripada mengelola flag boolean `isLoading` secara manual.

---

## 12. Konvensi Penamaan Terstandarisasi (Naming Conventions)

### Prinsip

Konsistensi penamaan mempermudah navigasi, pembacaan kode, dan pemahaman tim serta AI Agent.

### Aturan

| Kategori               | Konvensi                   | Contoh                                                      |
| :--------------------- | :------------------------- | :---------------------------------------------------------- |
| **File & Folder**      | `kebab-case`               | `calculator-wizard.tsx`, `use-blog-form.ts`, `_components/` |
| **Komponen React**     | `PascalCase`               | `CalculatorWizard`, `InvoiceTable`, `ProjectCard`           |
| **Interface & Type**   | `PascalCase`               | `AdminProjectType`, `InvoiceItemProps`                      |
| **Custom Hooks**       | `camelCase` (awalan `use`) | `useBlogForm`, `useCategoryManagement`                      |
| **Utility Functions**  | `camelCase`                | `formatCurrency`, `formatDate`, `slugify`                   |
| **Server Actions**     | `camelCase` (deskriptif)   | `upsertProjectType`, `deleteInvoiceAction`                  |
| **Konstanta & Enum**   | `UPPER_SNAKE_CASE`         | `ADMIN_ROUTES`, `DEFAULT_PAGE_SIZE`, `STATUS_META`          |
| **Folder Privat Rute** | Awalan underscore `_`      | `_components/`, `_hooks/`, `_data/`, `_utils/`              |

---

## 13. Sentralisasi Rute & Anti-Hardcoded Navigation (Zero Hardcoded Routes)

### Prinsip

Dilarang keras menulis path URL / rute secara manual (_hardcoded string literal_) pada tautan (`<Link href="...">`), tombol navigasi, pemanggilan API (`fetch`), pengalihan halaman (`redirect`), dan invalidasi cache (`revalidatePath`). Seluruh rute wajib diimpor dari [`lib/routes.ts`](../lib/routes.ts). Panduan lengkap tersedia di [`ai-agent-docs/routes-and-navigation.md`](routes-and-navigation.md).

### Aturan

- Gunakan grup rute yang sesuai:
  - `PUBLIC_ROUTES`: Rute publik (`home`, `about`, `blogDetail(slug)`, dll.).
  - `AUTH_ROUTES`: Autentikasi (`login`, `register`, `loginWithCallback(url)`, dll.).
  - `DASHBOARD_ROUTES`: Portal klien (`home`, `projects`, `projectDetail(id)`, dll.).
  - `ADMIN_ROUTES`: Portal admin (`home`, `users`, `projectDetail(id)`, dll.).
  - `API_ROUTES`: Endpoint API internal (`upload`, `search(q)`, `exportAnalytics`, dll.).
- Jika menambahkan halaman atau rute API baru, daftarkan terlebih dahulu ke `lib/routes.ts` sebelum menggunakannya di kode.

```tsx
// ❌ HINDARI: String literal rentan typo dan sulit direfaktor
<Link href="/dashboard/projects">Proyek</Link>
fetch("/api/upload", { ... });
revalidatePath("/admin/users");

// ✅ REKOMENDASI: Impor dari lib/routes.ts
import { DASHBOARD_ROUTES, API_ROUTES, ADMIN_ROUTES } from "@/lib/routes";

<Link href={DASHBOARD_ROUTES.projects}>Proyek</Link>
fetch(API_ROUTES.upload, { ... });
revalidatePath(ADMIN_ROUTES.users);
```

---

## 14. Sinkronisasi State ke URL Parameters (Shareable Deep-Linking)

### Prinsip

Seluruh state interaktif yang mengubah filter, kata kunci pencarian, urutan data, halaman paginasi, dan navigasi tab wajib direfleksikan ke dalam URL query parameters (`searchParams`).

### Aturan

- **Shareable State**: URL yang disalin dan dibagikan harus menampilkan kondisi antarmuka yang persis sama kepada penerima link.
- **Konvensi Parameter**:
  - Pencarian: `?q=` atau `?search=` (dengan debounce 300–400ms).
  - Filter: `?category=`, `?status=`, `?role=`.
  - Paging: `?page=`, `?limit=`. Setiap filter/search berubah, reset `page=1`.
  - Tab Aktif: `?tab=billing`, `?tab=overview`.
- Di Client Component, sinkronkan via `useSearchParams()` dan `router.replace(url, { scroll: false })`.
- Di Server Component (`page.tsx`), baca data langsung dari prop `searchParams`.

---

## 15. Standar Penanganan 4 UI States & Input Form Hygiene

### 1. Penanganan 4 Kondisi Antarmuka (4 UI States)

Setiap komponen penyaji data (tabel/grid/kartu) wajib menangani 4 kondisi:

1. **Loading State**: Wajib menggunakan `Skeleton` (`@/components/ui/skeleton`) yang meniru tata letak asli komponen (dilarang spinner polos atau layar putih kosong).
2. **Empty State**: Ketika data berjumlah 0 (`data.length === 0`), tampilkan ikon visual, pesan ramah informatif, dan tombol Call-to-Action (CTA) seperti "Reset Filter" atau "Tambah Data Baru".
3. **Error State**: Tampilkan kartu pesan error dengan tombol "Coba Lagi" (_Retry_) dan notifikasi toast `sonner`.
4. **Large Dataset State**: Wajib menerapkan paginasi atau virtualized scrolling jika data berjumlah ratusan/ribuan baris; sertakan info ringkasan jumlah data.

### 2. Standarisasi Input Form

- **Placeholder Wajib**: Setiap input teks, textarea, dan select trigger wajib memiliki placeholder kontekstual yang memberikan contoh nilai nyata (misal: `placeholder="Contoh: PT Teknologi Maju Indonesia"`).
- **Indikator Wajib (_Required_)**: Label field wajib menyertakan tanda bintang merah (`<span className="text-red-500">*</span>`).
- **Indikator Opsional (_Optional_)**: Label field opsional wajib secara eksplisit mencantumkan keterangan `(Opsional)` (`<span className="text-xs font-normal text-slate-500">(Opsional)</span>`).

---

## 16. Integritas Pengetesan & Sinkronisasi Test Suite (Test Mapping & Maintenance)

### Prinsip

Setiap modifikasi kode (fitur baru, perbaikan bug, atau refactoring) wajib diverifikasi dan dipayungi oleh unit test yang relevan. Dilarang mengubah kode tanpa memverifikasi test terkait.

### Aturan Operasional

1. **Pencarian Test Terkait (_Test Mapping_)**: Sebelum atau sesaat setelah mengedit berkas kode, cari file test yang menguji fungsi/modul tersebut menggunakan `find . -name "*.test.*"` atau `grep -rn "namaFungsi" lib/ tests/ app/`.
2. **Pembaruan Skenario Test**:
   - Jika kontrak fungsi atau logika bisnis dimodifikasi, **wajib memperbarui nilai ekspektasi test** agar sinkron.
   - Jika memperbaiki bug, **wajib menambahkan kasus uji regresi (_regression test_)** untuk menjamin bug tidak akan muncul kembali di masa depan.
   - Jika membuat modul/Server Action baru, **wajib menambahkan berkas test baru** (`*.test.ts`) dengan cakupan _happy path_ dan _edge cases_.
3. **Verifikasi Mandiri 100% PASS**: Jalankan `bun test <file.test.ts>` dan pastikan seluruh test suite `bun test` berstatus 0 fail sebelum menyatakan tugas selesai.

---

## 17. Disiplin Git Branching & Squash Merge (No Direct Commit to Main)

### Prinsip

Branch `main` adalah representasi cabang produksi yang stabil dan suci. Dilarang keras melakukan commit langsung ke branch `main`.

### Aturan Operasional

1. **Wajib Buat Branch Baru**: Setiap penanganan issue/task harus dimulai dengan membuat branch baru dari `main` terkini:
   - `feat/<fitur-singkat>` untuk fitur baru
   - `fix/<deskripsi-bug>` untuk perbaikan bug
   - `refactor/<komponen>` untuk refactoring kode
   - `docs/<topik>` untuk dokumentasi
   - `chore/<tugas>` untuk dependensi dan konfigurasi
2. **Commit Terstruktur pada Branch**: Lakukan commit pada branch kerja menggunakan format Conventional Commits (`feat: ...`, `fix: ...`).
3. **Pull Request & Squash and Merge**:
   - Ajukan Pull Request (PR) dari branch kerja menuju `main`.
   - Penggabungan ke branch `main` **WAJIB menggunakan strategi Squash and Merge** untuk memadatkan riwayat pengerjaan menjadi satu commit bersih dan informatif di `main`.

---

## 18. Kewajiban Pengujian UI untuk Setiap Komponen & Halaman (Mandatory UI Testing)

### Prinsip

Seluruh komponen visual, formulir interaktif, dialog modal, dan halaman rute Next.js (`page.tsx`) **WAJIB** memiliki file pengujian UI (`*.test.tsx` atau `*.test.ts`) pendamping. Dilarang merilis atau memodifikasi antarmuka pengguna tanpa pengujian otomatis yang memverifikasi perilakunya.

### Aturan Operasional

1. **Pola Co-location Wajib**: File pengujian UI wajib diletakkan tepat di direktori yang sama dengan komponen/halaman yang diuji (contoh: `app/(public)/ai-relay/page.test.tsx` di samping `page.tsx`, `components/dashboard/sidebar.test.ts` di samping `sidebar.tsx`).
2. **Cakupan Pengujian Wajib**:
   - **Rendering & Prop Initialization**: Memastikan fungsi komponen (RSC maupun RCC) menghasilkan elemen JSX yang valid dan tidak mengalami null-pointer crash.
   - **SEO Metadata Verification**: Pada halaman publik (`page.tsx`), verifikasi ekspor objek `metadata` (judul, deskripsi berbahasa Indonesia, dan canonical URL).
   - **Zero Hardcoded Routes**: Verifikasi bahwa seluruh tombol, link, dan pengalihan rute mengimpor konstanta resmi dari `lib/routes.ts`.
   - **Penanganan 4 UI States**: Uji kondisi Loading (Skeleton), Empty State (ikon + CTA), Error State (kartu error + retry), dan Large Dataset (paginasi URL).
   - **Standarisasi Input Form**: Verifikasi kehadiran placeholder kontekstual di setiap input, tanda bintang merah (`*`) untuk field required, dan label `(Opsional)` untuk field optional.
   - **Sinkronisasi URL Param State**: Uji integrasi state tab aktif (`?tab=`), filter/pencarian (`?q=`), dan paginasi (`?page=`).
   - **Modal Dialog & Interaktivitas**: Verifikasi pelarangan `window.confirm()` dan pastikan menggunakan `<ConfirmDialog>` serta notifikasi toast `sonner`.
3. **Eksekusi Test Runner**: Seluruh UI test dijalankan menggunakan `bun test` dan wajib lulus 100% tanpa error sebelum kode digabung. Panduan lengkap tersedia di [`ai-agent-docs/ui-testing.md`](ui-testing.md).

---

## Checklist Audit Mandiri (Self-Audit Checklist)

Sebelum menyelesaikan task pembuatan/modifikasi fitur, pastikan:

- [ ] Bekerja pada branch kerja terpisah (`feat/...`, `fix/...`), BUKAN langsung di branch `main`.
- [ ] Telah mencari file test terkait (`find . -name "*.test.*"` atau grep).
- [ ] Memperbarui skenario test yang ada atau menambahkan test baru untuk setiap perubahan logika/bugfix.
- [ ] Setiap komponen UI, form, modal, atau halaman rute memiliki file pengujian UI (`*.test.tsx` / `*.test.ts`) yang lolos 100% (`bun test`).
- [ ] Seluruh unit test & UI test lulus 100% tanpa kegagalan (`bun test`).
- [ ] Tidak ada file komponen yang membengkak melebihi batas wajar (~200–250 baris).
- [ ] Logika state/form kompleks telah dipisahkan ke dalam custom hook.
- [ ] Tidak ada penggunaan tipe `any`.
- [ ] Data form/action divalidasi dengan skema Zod di `lib/validations/`.
- [ ] Props yang dioper dari RSC ke RCC adalah _plain objects_.
- [ ] Mutasi dilengkapi feedback toast (`sonner`) dan loading state (`useTransition`).
- [ ] Styling menggunakan kelas Tailwind semantic dan fungsi `cn()`.
- [ ] Penamaan file, folder, dan simbol mengikuti standar konvensi.
- [ ] Seluruh tautan, navigasi, redirect, dan API call menggunakan konstanta terpusat dari `lib/routes.ts` (Zero Hardcoded Routes).
- [ ] Searching, filtering, sorting, pagination, dan navigasi tab tersinkronisasi ke URL search parameters (Deep-linking & Shareable State).
- [ ] Menangani 4 kondisi antarmuka: Loading Skeleton, Empty State informatif + CTA, Error State + Retry, dan Large Dataset pagination.
- [ ] Seluruh field input memiliki placeholder kontekstual, label field required bertanda bintang merah (`*`), dan field optional bertuliskan `(Opsional)`.
- [ ] Kode telah diformat menggunakan Prettier (`bun run format`) dan urutan utility class Tailwind tertata otomatis.
- [ ] Tidak ada URI/path absolut mesin (`file:///...`, `/home/...`) yang tersimpan di dalam berkas repositori (Portability Check).
- [ ] Siap diajukan Pull Request (PR) ke `main` dengan strategi Squash and Merge.
