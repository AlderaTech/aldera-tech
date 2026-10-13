# Standar Kualitas Kode & Arsitektur Modular (Code Quality Standards)

Dokumen ini merupakan panduan arsitektur dan kualitas kode resmi untuk repositori **Solvo Tech**. Seluruh AI Agent dan pengembang **WAJIB** mematuhi 13 prinsip berikut saat menulis, memodifikasi, atau merefaktor kode.

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

Dilarang keras menulis path URL / rute secara manual (_hardcoded string literal_) pada tautan (`<Link href="...">`), tombol navigasi, pemanggilan API (`fetch`), pengalihan halaman (`redirect`), dan invalidasi cache (`revalidatePath`). Seluruh rute wajib diimpor dari [`lib/routes.ts`](../lib/routes.ts). Panduan lengkap tersedia di [`docs/routes-and-navigation.md`](routes-and-navigation.md).

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

## Checklist Audit Mandiri (Self-Audit Checklist)

Sebelum menyelesaikan task pembuatan/modifikasi fitur, pastikan:

- [ ] Tidak ada file komponen yang membengkak melebihi batas wajar (~200–250 baris).
- [ ] Logika state/form kompleks telah dipisahkan ke dalam custom hook.
- [ ] Tidak ada penggunaan tipe `any`.
- [ ] Data form/action divalidasi dengan skema Zod di `lib/validations/`.
- [ ] Props yang dioper dari RSC ke RCC adalah _plain objects_.
- [ ] Mutasi dilengkapi feedback toast (`sonner`) dan loading state (`useTransition`).
- [ ] Styling menggunakan kelas Tailwind semantic dan fungsi `cn()`.
- [ ] Penamaan file, folder, dan simbol mengikuti standar konvensi.
- [ ] Seluruh tautan, navigasi, redirect, dan API call menggunakan konstanta terpusat dari `lib/routes.ts` (Zero Hardcoded Routes).
- [ ] Kode telah diformat menggunakan Prettier (`bun run format`) dan urutan utility class Tailwind tertata otomatis.
- [ ] Tidak ada URI/path absolut mesin (`file:///...`, `/home/...`) yang tersimpan di dalam berkas repositori (Portability Check).
