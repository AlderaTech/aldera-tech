# Aldera Tech — AI Development & UI/UX Standards Guidelines

Dokumen panduan ini mengatur standar antarmuka pengguna (UI/UX), konsistensi bahasa, arsitektur modal interaktif, dan aturan integritas sistem bagi para pengembang dan agen AI yang berkontribusi pada repositori Aldera Tech.

---

## 1. Standarisasi Kursor Pointer (Cursor Pointer Standards)

Semua elemen antarmuka yang dapat diklik atau memiliki interaksi pengguna wajib menampilkan kursor pointer (`cursor: pointer`).

### Aturan Komponen Primitif

Setiap komponen UI interaktif berbasis Radix UI dan Tailwind CSS harus menyertakan kelas utility `cursor-pointer`:

- **Button (`components/ui/button.tsx`)**: Varian dasar `buttonVariants` wajib menyertakan `cursor-pointer`.
- **Accordion (`components/ui/accordion.tsx`)**: `AccordionTrigger` wajib menyertakan `cursor-pointer`.
- **Tabs (`components/ui/tabs.tsx`)**: `TabsTrigger` wajib menyertakan `cursor-pointer`.
- **Select (`components/ui/select.tsx`)**: `SelectTrigger` dan `SelectItem` wajib memiliki kelas `cursor-pointer` (menggantikan `cursor-default`).
- **Checkbox (`components/ui/checkbox.tsx`)**: Elemen root checkbox wajib menyertakan `cursor-pointer`.
- **Dropdown Menu (`components/ui/dropdown-menu.tsx`)**: `DropdownMenuItem`, `DropdownMenuSubTrigger`, `DropdownMenuCheckboxItem`, dan `DropdownMenuRadioItem` wajib memiliki kelas `cursor-pointer`.
- **Badge / Chips**: Badge yang interaktif (memiliki event `onClick` atau dibungkus tautan `asChild`) wajib diberi `cursor-pointer`.

### Aturan Global CSS (`app/globals.css`)

Sebagai pengaman (_safety net_), aturan CSS global diterapkan di layer base untuk memastikan seluruh elemen interaktif bawaan HTML dan ARIA role button merespons interaksi kursor dengan benar:

```css
button:not(:disabled),
[role="button"]:not([aria-disabled="true"]):not([data-disabled]),
[type="button"]:not(:disabled),
[type="reset"]:not(:disabled),
[type="submit"]:not(:disabled),
summary,
a[href],
select:not(:disabled) {
  cursor: pointer;
}
```

---

## 2. Larangan Dialog Native Browser (Custom Confirmation Modals)

Dilarang keras menggunakan fungsi bawaan browser `window.confirm()` atau `window.alert()`.

### Aksi Destruktif & Konfirmasi

Semua aksi destruktif (seperti penghapusan data, pemutusan tautan akun, pembatalan pesanan, atau mutasi kritis) wajib menggunakan komponen modal konfirmasi kustom:

- Gunakan `<ConfirmDialog>` yang terletak di `@/components/shared/confirm-dialog`.
- Sifat modal:
  - Menyediakan judul (`title`) dan deskripsi (`description`) yang jelas mengenai konsekuensi tindakan.
  - Memiliki tombol konfirmasi berlabel eksplisit (misal: `"Hapus"`, `"Putuskan Tautan"`) dengan varian `destructive` jika menghapus data.
  - Mengelola status asinkron (`pending` / `Loader2` spinner) selama proses mutasi server berlangsung.
  - Mendukung penutupan via tombol Batal (`cancelLabel="Batal"`), backdrop click, atau tombol Esc (accessible focus trap).

### Notifikasi & Penanganan Error

- Gunakan `toast` dari package `sonner` (`toast.error()`, `toast.success()`, `toast.info()`) untuk menampilkan pesan status atau kegagalan aksi.
- Dilarang memunculkan alert pemblokir thread UI.

---

## 3. Desain Skeleton Loading (Skeleton Loading UI)

Setiap komponen atau halaman yang memuat data secara asinkron (_asynchronous data fetching_) wajib menyediakan tampilan state pemuatan berbasis Skeleton UI:

- Menggunakan komponen primitif `Skeleton` dari `@/components/ui/skeleton`.
- Desain skeleton harus mencerminkan struktur tata letak asli dari kartu (_Card_), tabel, atau grid konten yang sedang dimuat, bukan sekadar spinner teks atau ruang kosong.
- **Route-level Suspense**: Setiap rute dengan muatan data dinamis harus memiliki `loading.tsx` yang sesuai:
  - `app/dashboard/loading.tsx`: Skeleton dashboard utama.
  - `app/admin/loading.tsx`: Skeleton portal admin.
  - `app/(public)/loading.tsx`: Skeleton landing page publik.
  - `app/dashboard/orders/loading.tsx`: Skeleton riwayat estimasi dan pesanan klien.
  - `app/admin/testimonials/loading.tsx`: Skeleton manajemen testimoni.
- **Komponen Asinkron**: Kartu dengan status fetching (seperti `AccountBindingCard`) wajib merender skeleton card saat `loading === true`.

---

## 4. Konsistensi Bahasa & Lokalisasi (Language & Localization)

Antarmuka web Aldera Tech mengutamakan Bahasa Indonesia yang natural, profesional, dan konsisten bagi target pasar agensi rekayasa perangkat lunak di Indonesia.

### Satuan Waktu & Durasi

- Satuan durasi jam kerja atau kapasitas waktu wajib menggunakan `"jam"` atau singkatan `"j"`.
- Dilarang keras menggunakan akhiran bahasa Inggris `"h"` (contoh: gunakan `40 jam/minggu` atau `7.5 jam`, BUKAN `40h/minggu` atau `7.5h`).

### Navigasi Sidebar & Label Menu (`lib/dashboard-nav.ts`)

Label menu navigasi harus seragam dalam Bahasa Indonesia:

| Istilah Lama (Inggris/Campuran) | Istilah Baku (Bahasa Indonesia) |
| ------------------------------- | ------------------------------- |
| `Overview`                      | `Ringkasan`                     |
| `Order Requests`                | `Permohonan Pesanan`            |
| `File Manager`                  | `Manajer Berkas`                |
| `Revenue & Profitability`       | `Pendapatan & Profitabilitas`   |
| `Settings Website`              | `Pengaturan Situs`              |
| `Client Area`                   | `Area Klien`                    |
| `Portfolio`                     | `Portofolio`                    |

### Istilah Teknis yang Dipertahankan

Istilah teknologi yang sudah lazim digunakan secara universal di industri perangkat lunak tetap dipertahankan dalam Bahasa Inggris tanpa terjemahan paksaan:

- `API`, `API Key`, `Full-Stack`, `Cloud & DevOps`, `Database`, `Deploy`, `Playground`, `Token`, `Webhook`, `QRIS`.

---

## 5. Batasan Arsitektur & Integritas Data

1. **Strict Role Constraint**:
   Enum `Role` pada database Prisma tidak boleh ditambah atau diubah: hanya bernilai `ADMIN`, `DEVELOPER`, dan `CLIENT`.
2. **Price History Invariance**:
   Semua transaksi, pesanan (`OrderRequest`), proposal (`Proposal`), dan tagihan (`Invoice`) menyimpan nilai nominal statis (_snapshot values_). Modifikasi harga master pada katalog `ProjectType`, `FeatureOption`, atau `AddOnOption` dilarang mengubah histori nilai finansial yang telah terbit.
3. **No Dummy / Hardcoded Workarounds**:
   Implementasi logika perhitungan dan mutasi database harus selalu autentik dan divalidasi dengan test suite otomatis.

---

## 6. Sinkronisasi State Antarmuka ke URL Parameters (Deep-Linking & Shareable State)

Seluruh komponen interaktif yang mengubah tampilan data antarmuka pengguna **WAJIB** merefleksikan state-nya ke dalam URL search parameters (`query string`).

### Mengapa Aturan Ini Wajib?

- **Shareable State & Kolaborasi**: Ketika pengguna menyalin (_copy_) URL dari browser dan membagikannya ke rekan kerja, tim, atau klien, penerima link harus langsung melihat state antarmuka yang persis sama dengan pengirim (tab aktif yang sama, kata kunci pencarian yang sama, filter yang sama, dan nomor halaman yang sama).
- **History & Back/Forward Navigation**: Memungkinkan tombol kembali (_back_) dan maju (_forward_) pada browser bekerja sesuai ekspektasi pengguna tanpa kehilangan konteks filter.
- **Refresh Persistence**: Saat halaman di-refresh (F5), filter dan tab yang sedang dibuka pengguna tidak hilang atau ter-reset ke kondisi awal.

### Pola & Konvensi URL Parameter

1. **Pencarian (Searching)**:
   - Gunakan parameter `?q=` atau `?search=` (contoh: `/blog?q=nextjs`, `/admin/users?q=budi`).
   - Terapkan debouncing (300–400ms) sebelum menyinkronkan nilai input pencarian ke URL untuk menghindari spamming navigasi browser history.
2. **Penyaringan (Filtering)**:
   - Gunakan parameter deskriptif sesuai entitas (contoh: `?category=web`, `?status=PAID`, `?role=DEVELOPER`).
3. **Pengurutan (Sorting)**:
   - Gunakan parameter `?sort=` atau pasangan `?sortBy=` dan `?order=` (contoh: `?sort=createdAt_desc`, `?sortBy=total&order=asc`).
4. **Paginasi (Pagination / Paging)**:
   - Gunakan parameter `?page=` dan jika relevan `?limit=` (contoh: `/admin/invoices?page=2`).
   - Setiap kali filter atau kata kunci pencarian diubah, **wajib** me-reset parameter `page` kembali ke `1` (atau menghapus parameter `page`).
5. **Perpindahan Navigasi Tab (Tabs Navigation)**:
   - Setiap komponen `Tabs` utama yang memiliki konten berbeda wajib menyinkronkan tab aktif ke URL menggunakan `?tab=` (contoh: `/dashboard/ai-relay?tab=billing`, `/admin/calculator?tab=features`, `/admin/users?tab=workload`).
   - Komponen tabs harus membaca nilai `searchParams.get("tab")` sebagai `defaultValue` atau `value` aktifnya.

### Contoh Pola Implementasi (Client Component)

```tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Selalu reset page ke 1 saat filter atau search berubah
    if (key !== "page") {
      params.delete("page");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="text"
        placeholder="Cari berdasarkan nama atau invoice..."
        defaultValue={searchParams.get("q") ?? ""}
        onChange={(e) => updateFilter("q", e.target.value.trim() || null)}
        className="rounded-md border px-3 py-2 text-sm"
      />
    </div>
  );
}
```

---

## 7. Penanganan 4 Kondisi Antarmuka Komprehensif (The 4 UI States Rule)

Setiap halaman dan komponen data presentation (tabel, grid kartu, feed, atau daftar dokumen) **WAJIB** menangani 4 kondisi state secara eksplisit:

### 1. Loading State (Wajib Menggunakan Skeleton UI)

- **Aturan**: Selalu gunakan komponen `Skeleton` dari `@/components/ui/skeleton`.
- **Dilarang**: Dilarang hanya menampilkan spinner polos di tengah layar putih, teks `"Memuat data..."`, atau membiarkan layar kosong (_layout shift_).
- **Struktur Mirroring**: Desain Skeleton harus meniru tata letak asli dari kartu (_Card_), baris tabel (_Table Row_), avatar, atau metrik yang sedang dimuat sehingga transisi visual terasa mulus (_seamless_).

### 2. Empty State (Kondisi Data Kosong)

- **Aturan**: Ketika database kosong atau hasil pencarian/filter menghasilkan 0 item (`data.length === 0`), wajib tampilkan elemen Empty State yang ramah dan membantu:
  1. Ikon visual atau ilustrasi yang relevan (misal `FolderOpen`, `SearchX`, atau `FileQuestion` dari `lucide-react`).
  2. Judul yang jelas (misal: `"Tidak Ada Pesanan Ditemukan"` atau `"Belum Ada Riwayat Estimasi"`).
  3. Deskripsi penjelasan kontekstual (misal: `"Coba gunakan kata kunci pencarian lain atau sesuaikan filter Anda."`).
  4. Tombol aksi (_Call-to-Action_), seperti tombol `"Reset Filter"` atau tombol aksi utama `"Buat Pesanan Baru"`.
- **Dilarang**: Dilarang membiarkan tabel kosong melompong tanpa baris atau hanya menampilkan array kosong di antarmuka.

### 3. Error State (Kondisi Kegagalan Server / Jaringan)

- **Aturan**:
  - Tangani error pembacaan data dengan menampilkan kartu pesan error yang informatif di area tampilan terkait (bukan membiarkan aplikasi crash atau blank).
  - Sediakan tombol coba lagi (_Retry_) jika kegagalan bersifat sementara (jaringan atau query).
  - Untuk kegagalan mutasi atau aksi form, tampilkan pesan toast interaktif menggunakan `sonner` (`toast.error("Gagal menyimpan data: ...")`).

### 4. Large Dataset State (Kondisi Beban Data Masif)

- **Aturan**:
  - Dilarang keras merender ratusan atau ribuan baris DOM sekaligus secara langsung tanpa batasan.
  - Wajib menerapkan paginasi berbasis URL (`?page=1&limit=20`) atau virtual scrolling / cursor-based pagination.
  - Sediakan indikator ringkasan jumlah data (misal: `"Menampilkan 1–20 dari 1.450 data"`) serta kontrol navigasi halaman yang responsif (tombol _Previous_, _Next_, dan nomor halaman).

---

## 8. Standarisasi Input Form, Placeholder & Indikator Wajib/Opsional

Formulir merupakan titik kontak utama antara pengguna dan sistem Aldera Tech. Seluruh elemen input harus mematuhi standar berikut:

### 1. Wajib Memiliki Placeholder yang Informatif & Kontekstual

- Setiap field input teks, textarea, input angka, dan select trigger **WAJIB** memiliki atribut `placeholder`.
- Placeholder harus memberikan contoh nilai nyata yang valid, bukan sekadar mengulang nama label:
  - ❌ **Hindari**: `placeholder="Nama"` atau `placeholder="Input di sini..."`.
  - ✅ **Contoh Baik**:
    - `placeholder="Contoh: PT Teknologi Maju Indonesia"` (Nama Perusahaan / Klien)
    - `placeholder="nama@perusahaan.com"` (Email Bisnis)
    - `placeholder="Contoh: 081234567890"` (Nomor WhatsApp)
    - `placeholder="Jelaskan kebutuhan fungsional utama, fitur spesifik, dan target pengguna aplikasi..."` (Deskripsi Proyek)
    - `placeholder="Pilih jenis arsitektur proyek..."` (Select Trigger)

### 2. Indikator Field Wajib (_Required_): Bintang Merah

- Setiap label untuk field yang bersifat wajib (_required_) **WAJIB** menyertakan tanda bintang merah di samping teks labelnya:
  ```tsx
  <Label htmlFor="projectName">
    Nama Proyek <span className="font-semibold text-red-500">*</span>
  </Label>
  ```
- Bisa juga menggunakan utility `text-destructive` dari token Tailwind semantic Aldera Tech.

### 3. Indikator Field Opsional (_Optional_): Keterangan Eksplisit

- Setiap label untuk field yang bersifat opsional / tidak wajib diisi **WAJIB** mencantumkan keterangan `(Opsional)` secara eksplisit:
  ```tsx
  <Label htmlFor="projectNotes">
    Catatan Tambahan{" "}
    <span className="text-xs font-normal text-slate-500">(Opsional)</span>
  </Label>
  ```
- Ini memberikan kejelasan instan kepada pengguna tanpa perlu menebak-nebak field mana yang harus diisi untuk menyelesaikan formulir.

---

## 9. Disiplin Git Branching, Commit & Squash Merge (No Direct Commit to Main)

Untuk menjaga stabilitas cabang produksi dan kemudahan peninjauan kode, seluruh pengembang dan agen AI wajib menerapkan alur kerja branching berikut:

### 1. Larangan Commit Langsung ke `main`

- Branch `main` merupakan representasi dari kode produksi yang siap dirilis. Dilarang keras melakukan `git commit` maupun `git push` langsung pada branch `main`.

### 2. Konvensi Branch Kerja

Setiap kali mengerjakan fitur, bugfix, atau perbaikan, wajib membuat branch baru dari `main`:

- `feat/<nama-fitur>`: Penambahan fitur atau rute baru
- `fix/<deskripsi-bug>`: Perbaikan bug atau celah keamanan
- `refactor/<nama-komponen>`: Restrukturisasi kode tanpa mengubah perilaku
- `docs/<nama-dokumen>`: Pembaruan atau penambahan dokumentasi
- `chore/<nama-tugas>`: Pemeliharaan dependensi, skrip, atau konfigurasi

### 3. Alur Kerja Pull Request & Squash Merge

1. Buat branch baru: `git checkout -b <type>/<nama-tugas>`.
2. Lakukan perubahan kode, formatting, linting, dan pengujian.
3. Commit pada branch kerja dengan pesan Conventional Commits (`feat: ...`, `fix: ...`).
4. Buat Pull Request (PR) ke branch `main`.
5. Penggabungan ke `main` **WAJIB menggunakan Squash and Merge** sehingga riwayat commit di `main` tetap bersih, linier, dan terdokumentasi rapi.

---

## 10. Protokol Integritas Pengetesan & Pembaruan Test Suite

Setiap perubahan kode harus didukung oleh pengujian otomatis yang relevan untuk mencegah timbulnya regresi di masa depan:

### 1. Pencarian Test Terkait (_Test Mapping_)

- Setiap kali memodifikasi sebuah fungsi, utilitas, Server Action, atau komponen UI, AI Agent **WAJIB** mencari file pengujian yang menguji fungsi tersebut menggunakan `find . -name "*.test.*"` atau `grep -rn "namaSimbol" lib/ tests/ app/`.

### 2. Pembaruan & Penambahan Skenario Pengujian

- **Perubahan Kontrak / Logika**: Jika perilaku suatu fungsi berubah, perbarui ekspektasi assertion pada file test terkait.
- **Perbaikan Bug**: Tambahkan kasus uji regresi (_regression test_) baru yang memverifikasi bahwa bug yang dilaporkan tidak dapat terjadi lagi.
- **Fitur Baru**: Buat file test baru (`*.test.ts`) yang menguji skenario umum (_happy path_) dan kasus batas (_boundary/error handling_).

### 3. Verifikasi Eksekusi

- Jalankan test modul: `bun test <path/to/file.test.ts>`.
- Jalankan test suite menyeluruh: `bun test` untuk memastikan seluruh 100% tes lulus (0 fail) sebelum branch/PR dinyatakan siap dimerge.

---

## 11. Standarisasi Pengujian Antarmuka Pengguna (UI Testing Standards & Protocols)

Seluruh antarmuka pengguna, komponen presentasi, formulir interaktif, dialog modal, dan halaman rute (`page.tsx`) di repositori Aldera Tech **WAJIB** memiliki file pengujian UI (`*.test.tsx` atau `*.test.ts`) pendamping.

### 1. Prinsip Co-location & Runner `bun test`

- File pengujian UI wajib diletakkan secara berdampingan (_co-located_) di folder yang sama dengan komponen/halaman yang diuji (contoh: `app/(public)/ai-relay/page.test.tsx`, `components/dashboard/sidebar.test.ts`).
- Pengujian dijalankan menggunakan runner native **`bun test`** yang cepat dan mendukung JSX/TSX tanpa bundler terpisah.

### 2. 7 Aspek Pengujian UI Wajib (The 7 Pillars of UI Testing)

Setiap file pengujian UI wajib menguji aspek relevan dari 7 pilar berikut:

1. **Validitas JSX & Prop Initialization**: Memastikan fungsi komponen (RSC maupun Client Component) merender elemen React yang valid, menerima `initialProps` atau data dari database tanpa error null pointer.
2. **SEO Metadata (RSC Pages)**: Memverifikasi ekspor objek `metadata` pada halaman rute publik, termasuk kesesuaian judul, deskripsi berbahasa Indonesia, dan canonical URL ke rute publik terkait.
3. **Zero Hardcoded Routes**: Memastikan seluruh link navigasi (`<Link href="...">`), tombol CTA, dan pengalihan rute mengimpor konstanta resmi dari `lib/routes.ts` (`PUBLIC_ROUTES`, `AUTH_ROUTES`, `DASHBOARD_ROUTES`, `ADMIN_ROUTES`).
4. **Penanganan 4 UI States**:
   - **Loading**: Menguji rendering `Skeleton` yang meniru tata letak asli.
   - **Empty State**: Menguji rendering saat data kosong (`data.length === 0`), memastikan kehadiran ikon, pesan ramah, dan tombol CTA.
   - **Error State**: Menguji rendering pesan kesalahan informatif dan tombol Coba Lagi (_Retry_).
   - **Large Dataset**: Menguji batas paginasi URL (`?page=1&limit=20`) dan kalkulasi kuantitas data.
5. **Form Input Hygiene**:
   - Memverifikasi keberadaan atribut `placeholder` kontekstual yang memberikan contoh nilai nyata.
   - Memverifikasi tanda bintang merah (`*`) pada label field required.
   - Memverifikasi keterangan `(Opsional)` secara eksplisit pada label field optional.
   - Menguji pemetaan pesan error validasi Zod di bawah input terkait.
6. **Sinkronisasi Parameter URL (Shareable Deep-Linking)**:
   - Memverifikasi bahwa navigasi tab aktif membaca dan menyinkronkan parameter `?tab=`.
   - Memverifikasi bahwa filter dan input pencarian tersinkronkan ke URL parameter (`?q=`, `?category=`, `?status=`) dan me-reset parameter `page` ke `1`.
   - Menguji helper active state menu navigasi (seperti `isNavItemActive`) untuk mencegah bug menu aktif ganda.
7. **Modal Dialog & User Feedback**:
   - Memverifikasi tidak adanya pemanggilan native dialog `window.confirm()` atau `window.alert()`.
   - Memverifikasi penggunaan komponen `<ConfirmDialog>` untuk aksi destruktif.
   - Memverifikasi feedback interaktif melalui notifikasi toast `sonner`.

Panduan operasional, arsitektur, dan contoh template lengkap pengujian antarmuka pengguna terdokumentasi di [`ai-agent-docs/ui-testing.md`](ui-testing.md).
