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
Sebagai pengaman (*safety net*), aturan CSS global diterapkan di layer base untuk memastikan seluruh elemen interaktif bawaan HTML dan ARIA role button merespons interaksi kursor dengan benar:
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

Setiap komponen atau halaman yang memuat data secara asinkron (*asynchronous data fetching*) wajib menyediakan tampilan state pemuatan berbasis Skeleton UI:
- Menggunakan komponen primitif `Skeleton` dari `@/components/ui/skeleton`.
- Desain skeleton harus mencerminkan struktur tata letak asli dari kartu (*Card*), tabel, atau grid konten yang sedang dimuat, bukan sekadar spinner teks atau ruang kosong.
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
|---|---|
| `Overview` | `Ringkasan` |
| `Order Requests` | `Permohonan Pesanan` |
| `File Manager` | `Manajer Berkas` |
| `Revenue & Profitability` | `Pendapatan & Profitabilitas` |
| `Settings Website` | `Pengaturan Situs` |
| `Client Area` | `Area Klien` |
| `Portfolio` | `Portofolio` |

### Istilah Teknis yang Dipertahankan
Istilah teknologi yang sudah lazim digunakan secara universal di industri perangkat lunak tetap dipertahankan dalam Bahasa Inggris tanpa terjemahan paksaan:
- `API`, `API Key`, `Full-Stack`, `Cloud & DevOps`, `Database`, `Deploy`, `Playground`, `Token`, `Webhook`, `QRIS`.

---

## 5. Batasan Arsitektur & Integritas Data

1. **Strict Role Constraint**:
   Enum `Role` pada database Prisma tidak boleh ditambah atau diubah: hanya bernilai `ADMIN`, `DEVELOPER`, dan `CLIENT`.
2. **Price History Invariance**:
   Semua transaksi, pesanan (`OrderRequest`), proposal (`Proposal`), dan tagihan (`Invoice`) menyimpan nilai nominal statis (*snapshot values*). Modifikasi harga master pada katalog `ProjectType`, `FeatureOption`, atau `AddOnOption` dilarang mengubah histori nilai finansial yang telah terbit.
3. **No Dummy / Hardcoded Workarounds**:
   Implementasi logika perhitungan dan mutasi database harus selalu autentik dan divalidasi dengan test suite otomatis.
