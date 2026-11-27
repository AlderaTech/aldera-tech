# Rute dan navigasi

`lib/routes.ts` adalah sumber kebenaran untuk path internal dan builder query. Jangan menyalin seluruh daftar route ke dokumentasi; buka file tersebut saat membutuhkan nilai terbaru.

## Penggunaan

Impor konstanta sesuai area:

- `PUBLIC_ROUTES` untuk halaman publik.
- `AUTH_ROUTES` untuk autentikasi.
- `DASHBOARD_ROUTES` untuk portal klien.
- `ADMIN_ROUTES` untuk panel staf.
- `API_ROUTES` untuk endpoint internal.

Gunakan konstanta dan builder yang tersedia untuk tautan, redirect, revalidasi cache, dan fetch internal. Untuk query search, filter, tab, atau pagination, pakai builder yang sesuai; jangan merakit URL dengan interpolasi string. Query yang mengubah tampilan daftar harus dapat dibuka ulang dari URL.

## Menambah atau mengubah route

1. Tambahkan atau ubah konstanta/builder di `lib/routes.ts`.
2. Sinkronkan navigasi dan server authorization yang relevan. Middleware bukan pengganti pemeriksaan permission dan kepemilikan data pada action atau handler.
3. Perbarui test route terkait.
4. Perbarui [roles-and-features.md](roles-and-features.md) hanya bila model akses atau batas otorisasi berubah.

Dokumen ini menjelaskan pola penggunaan. Implementasi dan test menjadi sumber kebenaran atas daftar route.
