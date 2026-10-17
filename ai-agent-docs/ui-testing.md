# Panduan Standar Pengujian Antarmuka Pengguna (UI Testing Standards & Protocols)

Dokumen ini merupakan panduan operasional standar (_Standard Operating Procedure_) resmi untuk penulisan dan pemeliharaan pengujian antarmuka pengguna (**UI Testing**) di repositori **Aldera Tech**. Seluruh AI Agent dan pengembang **WAJIB** membuat dan memelihara file UI test untuk setiap komponen antarmuka pengguna.

---

## 1. Prinsip Utama: Wajib UI Test untuk Setiap UI (Mandatory UI Testing)

> [!IMPORTANT]
> **Setiap komponen UI, halaman rute (`page.tsx`), formulir, tabel data, modal, dan elemen interaktif lainnya WAJIB memiliki berkas pengujian UI (`*.test.tsx` atau `*.test.ts`) pendamping.**
> Dilarang membuat halaman baru atau mengubah komponen antarmuka tanpa menyertakan atau memperbarui file pengujian UI terkait.

### Mengapa Pengujian UI Wajib?

1. **Mencegah Regresi Visual & Fungsional**: Memastikan perubahan logika di backend atau refaktor styling tidak merusak elemen antarmuka, binding data, atau navigasi.
2. **Menjamin Kontrak Antarmuka (UI Contract)**: Memverifikasi bahwa komponen selalu merender elemen yang valid, menerima props yang diharapkan, dan menampilkan fallback ketika data kosong atau error.
3. **Validasi Kepatuhan Standar Aksesibilitas & Form Hygiene**: Menjamin setiap form memiliki placeholder kontekstual, tanda bintang merah untuk field wajib, dan label eksplisit untuk field opsional.
4. **Verifikasi Integritas Rute**: Memastikan tidak ada URL yang di-hardcode (seluruh tautan dan aksi navigasi menggunakan konstanta dari `lib/routes.ts`).

---

## 2. Alat Pengujian & Konvensi Berkas (Testing Tooling & Co-location)

### Test Runner: `bun test`

- Seluruh pengujian dijalankan menggunakan runner native **`bun test`**.
- Runner ini cepat, mendukung TypeScript dan JSX/TSX secara instan tanpa konfigurasi bundler tambahan:
  ```bash
  # Menjalankan pengujian UI spesifik
  bun test app/(public)/ai-relay/page.test.tsx

  # Menjalankan seluruh pengujian UI komponen
  bun test components/dashboard/sidebar.test.ts

  # Menjalankan seluruh test suite repositori
  bun test
  ```

### Pola Co-location Berkas Pengujian

Berkas pengujian **WAJIB diletakkan berdampingan langsung** (_co-located_) di direktori yang sama dengan komponen atau halaman yang diuji:

```
app/(public)/ai-relay/
├── page.tsx                    # Halaman RSC Publik
├── page.test.tsx               # UI Test untuk page.tsx (Metadata, Catalog, Navigasi)
└── _components/
    ├── model-catalog-view.tsx
    └── model-catalog-view.test.tsx

components/dashboard/
├── sidebar.tsx                 # Komponen Sidebar Navigasi
└── sidebar.test.ts             # Test logika navigasi & active state
```

### Konvensi Penamaan File

- Halaman Rute Next.js: `page.test.tsx` (ditempatkan di folder rute yang sama dengan `page.tsx`).
- Komponen UI JSX/TSX: `<nama-komponen>.test.tsx` (contoh: `balance-topup-card.test.tsx`).
- Helper / Logic Navigasi UI: `<nama-helper>.test.ts` (contoh: `sidebar.test.ts`).

---

## 3. Cakupan Pengujian Wajib Berdasarkan Tipe UI

### A. Pengujian Halaman Rute (Server Components / `page.tsx`)

Setiap file `page.tsx` wajib diuji untuk aspek-aspek berikut:

1. **Rendering Elemen & Struktur JSX**:
   - Memanggil fungsi komponen server (misal: `const jsx = await Page()`).
   - Memastikan elemen React yang dikembalikan terdefinisi (`expect(jsx).toBeDefined()`), memiliki properti awal (`initialProps`), dan data katalog/tabel bukan `undefined`.
2. **Verifikasi SEO Metadata**:
   - Memeriksa objek `metadata` yang diekspor.
   - Memverifikasi panjang dan kata kunci judul (`metadata.title`).
   - Memverifikasi deskripsi berbahasa Indonesia yang informatif (`metadata.description`).
   - Memverifikasi canonical URL mengarah ke rute publik terkait (`metadata.alternates.canonical === PUBLIC_ROUTES.xxx`).
3. **Integritas Rute & Navigasi (Zero Hardcoded Routes)**:
   - Memastikan seluruh link CTA (daftar, login, konsultasi, dokumentasi) mengarah ke rute resmi dari `lib/routes.ts` (`PUBLIC_ROUTES`, `AUTH_ROUTES`, `DASHBOARD_ROUTES`, `ADMIN_ROUTES`).
   - Memverifikasi keberadaan entri rute pada konfigurasi navigasi global (`lib/nav-config.ts` atau `lib/dashboard-nav.ts`).

### B. Pengujian Formulir & Input Data (Form & Input Hygiene)

Setiap formulir input (registrasi, login, permohonan pesanan, manajemen katalog, upload berkas) wajib diuji untuk:

1. **Placeholder Informatif & Kontekstual**:
   - Memverifikasi bahwa setiap field input, textarea, dan select trigger memiliki atribut `placeholder` yang memberikan contoh nilai nyata yang valid (bukan sekadar mengulang nama label).
2. **Indikator Field Wajib (`*`)**:
   - Memverifikasi bahwa label untuk field wajib memiliki tanda bintang merah (`text-red-500` atau `text-destructive`).
3. **Indikator Field Opsional (`(Opsional)`)**:
   - Memverifikasi bahwa label untuk field opsional secara eksplisit memuat string `(Opsional)`.
4. **Validasi Error Skema Zod**:
   - Menguji bahwa input yang tidak valid (string kosong, format email salah, angka negatif) memicu pesan kesalahan yang spesifik di bawah input terkait.
5. **Status Loading & Tombol Submit Disabled**:
   - Memverifikasi tombol submit dalam status disabled dan menampilkan spinner selama mutasi atau transisi berlangsung (`isPending === true`).

### C. Pengujian Komponen Penyaji Data (The 4 UI States Rule)

Komponen yang menampilkan daftar data (tabel admin, daftar proyek klien, katalog model, feed blog, riwayat tagihan) wajib diuji untuk **4 kondisi antarmuka**:

1. **Loading State (Skeleton UI)**:
   - Memverifikasi komponen merender `Skeleton` dari `@/components/ui/skeleton`.
   - Memastikan skeleton memiliki struktur yang meniru tata letak data sebenarnya (misal: jumlah baris tabel skeleton atau kartu grid skeleton).
2. **Empty State**:
   - Menguji rendering saat data bernilai kosong (`data = []`).
   - Memverifikasi kehadiran ikon representatif, pesan ramah yang jelas, dan tombol Call-to-Action (CTA) (misal: tombol `"Tambah Data Baru"` atau `"Reset Filter"`).
3. **Error State**:
   - Menguji perilaku komponen ketika fetching data gagal atau mengembalikan error.
   - Memverifikasi pesan kesalahan informatif dan tombol Coba Lagi (_Retry_).
4. **Large Dataset State & Pagination**:
   - Menguji perilaku ketika data melebihi batas per-halaman.
   - Memverifikasi bahwa nomor halaman, tombol navigasi (_Previous_, _Next_), dan ringkasan kuantitas (misal: `"Menampilkan 1–20 dari 500 data"`) terhitung dan terender dengan akurat.

### D. Pengujian Interaktivitas & Sinkronisasi URL Parameter (Shareable State)

1. **Sinkronisasi Tab Aktif**:
   - Menguji bahwa tab aktif membaca parameter URL `?tab=` (contoh: `?tab=billing` membuka tab billing, `?tab=overview` membuka tab ringkasan).
2. **Pencarian & Filter**:
   - Menguji fungsi filter / helper pencarian terhadap query string `?q=`, `?category=`, `?status=`.
   - Memverifikasi parameter `page` di-reset ke `1` ketika filter atau kata kunci pencarian berubah.
3. **Logika Active State Menu Navigasi**:
   - Menguji helper active state seperti `isNavItemActive(pathname, href, allHrefs)`.
   - Memastikan tidak ada _double active menu_ (contoh: membuka `/admin/blog/categories` hanya mengaktifkan menu Kategori Blog, bukan menu Blog utama).

### E. Pengujian Modal & Aksi Destruktif

1. **Larangan Native Dialog**:
   - Memastikan komponen tidak memanggil `window.confirm()` atau `window.alert()`.
2. **Penggunaan `<ConfirmDialog>`**:
   - Memverifikasi modal konfirmasi kustom memuat judul, deskripsi konsekuensi, dan tombol aksi berlabel jelas (dengan varian `destructive` jika menghapus data).
3. **Toast Feedback**:
   - Memverifikasi bahwa aksi mutasi memanggil toast notifikasi (`toast.success` atau `toast.error` dari Sonner).

---

## 4. Pola & Contoh Penulisan UI Test

### Contoh 1: Pengujian Halaman Publik / RSC (`page.test.tsx`)

```tsx
import { describe, it, expect } from "bun:test";
import { metadata } from "./page";
import PublicPage from "./page";
import { PUBLIC_ROUTES, AUTH_ROUTES } from "@/lib/routes";

describe("Public Feature Page UI Test", () => {
  describe("SEO Metadata", () => {
    it("exports valid metadata with expected title and canonical URL", () => {
      expect(metadata).toBeDefined();
      expect(String(metadata.title)).toContain("Aldera Tech");
      expect(metadata.alternates?.canonical).toBe(PUBLIC_ROUTES.feature);
    });
  });

  describe("Server Page Component Rendering", () => {
    it("renders valid JSX element and populates initial props", async () => {
      const jsx = await PublicPage();
      expect(jsx).toBeDefined();
      expect(jsx.type).toBeDefined();
      expect(jsx.props).toBeDefined();
    });

    it("ensures all navigation links adhere to zero hardcoded routes rule", () => {
      expect(PUBLIC_ROUTES.feature).toBe("/feature");
      expect(AUTH_ROUTES.login).toBe("/login");
    });
  });
});
```

### Contoh 2: Pengujian Active State & Navigasi Sidebar (`sidebar.test.ts`)

```tsx
import { describe, expect, it } from "bun:test";
import { isNavItemActive } from "@/components/dashboard/sidebar";
import { ADMIN_ROUTES } from "@/lib/routes";

describe("Sidebar Navigation UI Logic", () => {
  const allHrefs = [
    ADMIN_ROUTES.home,
    ADMIN_ROUTES.blog,
    ADMIN_ROUTES.blogCategories,
  ];

  it("activates /admin/blog/categories exclusively without double active highlights", () => {
    expect(
      isNavItemActive("/admin/blog/categories", ADMIN_ROUTES.blog, allHrefs)
    ).toBe(false);

    expect(
      isNavItemActive(
        "/admin/blog/categories",
        ADMIN_ROUTES.blogCategories,
        allHrefs
      )
    ).toBe(true);
  });
});
```

### Contoh 3: Pengujian Penanganan 4 Kondisi Antarmuka & Form Hygiene

```tsx
import { describe, it, expect } from "bun:test";
import { formatCurrency, calculatePagination } from "@/lib/utils";

describe("Data Presentation & Pagination Logic", () => {
  it("calculates large dataset pagination bounds correctly", () => {
    const { totalPages, hasNext, hasPrev } = calculatePagination({
      totalItems: 1450,
      pageSize: 20,
      currentPage: 2,
    });

    expect(totalPages).toBe(73);
    expect(hasNext).toBe(true);
    expect(hasPrev).toBe(true);
  });
});
```

---

## 5. Checklist Verifikasi UI Test untuk AI Agent

Sebelum menyatakan tugas antarmuka pengguna selesai, AI Agent **WAJIB** memverifikasi checklist berikut:

```
[ ] 1. Co-location Check: File test (*.test.tsx atau *.test.ts) telah dibuat di samping file UI terkait.
[ ] 2. Component/Page Rendering: Menguji bahwa komponen merender elemen JSX yang valid.
[ ] 3. SEO Metadata: Menguji objek metadata (title, description, canonical) pada halaman publik.
[ ] 4. Route Constants: Memastikan seluruh tautan navigasi diverifikasi menggunakan konstanta lib/routes.ts.
[ ] 5. The 4 UI States:
    - [ ] Loading Skeleton diuji.
    - [ ] Empty State (ikon + pesan ramah + CTA) diuji.
    - [ ] Error State (pesan error + retry/toast) diuji.
    - [ ] Large Dataset State (paginasi URL) diuji.
[ ] 6. Form Hygiene:
    - [ ] Atribut placeholder kontekstual diverifikasi di setiap input.
    - [ ] Indikator bintang merah (*) pada field required diverifikasi.
    - [ ] Keterangan (Opsional) pada field optional diverifikasi.
[ ] 7. URL Parameter State:
    - [ ] Navigasi tab (?tab=) diverifikasi.
    - [ ] Filter/search (?q=, ?category=) diverifikasi.
[ ] 8. Test Execution:
    - [ ] Menjalankan bun test <file-ui.test.tsx> dan lulus 100%.
    - [ ] Menjalankan bun test menyeluruh dan memastikan 0 fail.
```
