# UI AI Gateway / Relay pada dashboard

## Lingkup dan tema

Rute `/dashboard/ai-relay` memakai tema dashboard: Plus Jakarta Sans, navy/biru elektrik, putih, kartu membulat, border tipis, dan tombol pill. Header dan sidebar memakai varian studio melalui `getStudioDashboardSection`, seperti pada [Ringkasan pengguna](dashboard-overview-ui.md). Navigasi sidebar memakai `DASHBOARD_ROUTES.aiRelay` dari konfigurasi menu yang sudah tersedia; status aktif ditentukan oleh `isNavItemActive` pada sidebar.

`relay-workspace.module.css` memakai kelas lokal `workspace`. Gaya portal dialog dan dropdown dibatasi dengan `body:has(.workspace)`, sehingga hanya aktif ketika halaman ini terpasang. Komponen dashboard lain, halaman publik AI Relay, dan penggunaan komponen bersama tanpa ilustrasi opsional mempertahankan tampilannya. Tidak ada perubahan CSS global atau primitif UI bersama.

## Susunan dan tab

Header ringkas menampilkan judul Aldera AI API Relay, deskripsi pengelolaan model/IDE/saldo, mini maskot koneksi, saldo dari state asli, dan tombol Top-up Saldo yang tetap membuka tab billing. Navigasi delapan tab tetap memakai Radix Tabs dan nilai aslinya: `catalog`, `playground`, `keys`, `billing`, `telegram`, `analytics`, `simulator`, `health`. Track dapat digulir horizontal tanpa membungkus label; navigasi keyboard, aturan akses, query `tab`, dan perilaku perpindahan state dipertahankan.

| Tab                  | Presentasi                                                                                                                                                                                                                                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Katalog Model        | Filter kategori, pencarian berlabel aksesibel, dan kartu 1–3 kolom mengikuti lebar area konten. Nama, kategori, ID, tarif input/output per 1M token, konteks, kegunaan, serta dua CTA menggunakan data asli. ID lengkap disimpan pada teks/title dan callback salin. Footer kartu sejajar dalam setiap baris.                       |
| Playground Chat      | Panel chat, pemilih model, system prompt, pesan, contoh prompt, dan input dipisahkan dari telemetri. Mini asisten tampil hanya ketika percakapan kosong. Kontrol kirim/reset berlabel aksesibel; isi pesan tidak ditutupi maskot.                                                                                                   |
| API Keys             | Kartu, tabel, dialog pembuatan, peringatan penayangan sekali, masking prefix, serta konfirmasi pencabutan mengikuti tema lokal. Handler dan sumber kunci tidak diubah.                                                                                                                                                              |
| Saldo & Ledger       | Saldo, peringatan saldo rendah, riwayat, dialog nominal, tiket, salin total transfer, dan unggah bukti mempertahankan alur asli. Angka dan status tidak ditulis ulang dalam UI.                                                                                                                                                     |
| Telegram Bot         | Panel instruksi, status, kode/link, dan konfirmasi pemutusan menggunakan state serta action asli. Tidak ada pesan Telegram yang dikirim oleh perubahan UI.                                                                                                                                                                          |
| Analitik & Log       | Ringkasan, navigasi grafik, empty state, dan tabel memakai tema yang sama. Tab grafik dapat digulir lokal pada layar kecil; penghitungan dan data grafik/log tidak berubah.                                                                                                                                                         |
| Komparasi & Simulasi | Dua model dapat dibandingkan dengan pemilih berlabel. Tiga slider memiliki nama aksesibel; batas, langkah, nilai awal, serta rumus 30 hari dipertahankan.                                                                                                                                                                           |
| Status & Latensi     | Agregasi, status per model, jumlah panggilan, dan angka terukur tetap berasal dari data. Pada varian dashboard, fallback numerik latensi/throughput diganti teks Belum ada data. Kartu gateway mengarahkan pembacaan ke status tiap model, tanpa menampilkan klaim 100% Online statis. Varian lain mempertahankan fallback aslinya. |

Loading rute dan fallback Suspense memakai `RelayLoading`: skeleton header, track tab, dan kartu mengikuti bentuk konten akhir. Tabel, kode JSON, dan track tab menampung scroll horizontal secara lokal. Dialog memiliki batas tinggi viewport serta scroll vertikal; konten grid dialog dibatasi agar tidak melebar karena ID/kode panjang. Reduced motion menonaktifkan transisi dekoratif.

## Maskot

Tiga pose baru memakai referensi maskot Beranda, dengan alpha transparan, static import, `next/image`, dimensi intrinsik 512 × 512, kualitas 90, dan sizes responsif. Gambar dekoratif memakai alt kosong, `aria-hidden`, dan `pointer-events: none`. Maskot sambutan sekitar 96px, coding sekitar 96px dalam dialog IDE, dan asisten sekitar 104px pada empty state. Coding disembunyikan pada HP agar judul dialog tetap lega. Tidak ada animasi maskot yang terus bergerak.

Spesifikasi aset, lokasi, dan prompt final tersedia di [dashboard-ai-relay-mascots.md](dashboard-ai-relay-mascots.md).

## Integritas fungsi

`app/dashboard/ai-relay/page.tsx` tetap menjalankan autentikasi, redirect, dan tujuh pemanggilan data yang sama. Hash konten halaman server, `lib/actions/ai-relay.ts`, `lib/actions/binding.ts`, `lib/ai-relay-utils.ts`, `lib/balance-guard.ts`, `lib/ai-relay-auth.ts`, `lib/router-db.ts`, dan `lib/routes.ts` cocok dengan salinan sebelum redesain.

State workspace, pencarian/filter/salin katalog, eksekusi chat, dan rumus simulator dipindahkan ke hook presentasi tanpa mengganti mekanisme. Model default, pemilihan model dari kartu, penanganan gpt-4o-mini, prompt, saldo, payload, respons, token, total biaya, dan callback saldo dipertahankan. Tidak ada perubahan provider, endpoint, API key sebenarnya, tarif, transaksi, autentikasi, atau streaming. Tidak ada dependensi, env var, atau kebutuhan Docker baru.

## Pemeriksaan

- Delapan tab diperiksa pada lebar 320, 390, 768, 1024, dan 1440px tanpa overflow halaman. Dialog IDE dan tiket top-up juga diperiksa pada layar kecil.
- Enam model cocok persis dengan teks kartu sebelum perubahan: urutan, ID, kategori, tarif, konteks, dan kegunaan. Pencarian Claude, seluruh kategori, serta hasil kosong diperiksa. Salin ID lengkap dan JSON IDE diperiksa dengan clipboard mock.
- Query `?tab=simulator` membuka tab yang sesuai. Slider melalui keyboard mengubah permintaan dari 100 ke 110/hari: proyeksi Claude 3.5 Sonnet dari Rp648.000 menjadi Rp712.800 dan DeepSeek V3 dari Rp26.400 menjadi Rp29.040, memakai parameter prompt 2.000 dan completion 500. Memilih model yang sama menyembunyikan selisih penghematan.
- Mock browser menahan POST sebelum mencapai server untuk memeriksa pembuatan/pencabutan key, penayangan sekali, masking, salin, top-up pending/error/retry/sukses, nominal/kode unik, unggah bukti, kode Telegram, dan pemutusan tautan. Tidak ada transaksi, kunci, unggahan, atau penghubungan sungguhan dari pemeriksaan ini.
- Playground memeriksa penolakan saldo nol serta pending/sukses/error dengan saldo dan respons mock hanya dalam memori browser. Model pada payload tetap `deepseek-reasoner` setelah dipilih dari katalog. Token, biaya, callback saldo, isi respons, dan toast mengikuti respons mock; saldo server tidak diubah.
- Jumlah baris database router sebelum/sesudah tetap: 0 key, 2 tiket top-up yang sudah tersedia, 0 ledger, dan 0 log. Halaman dimuat ulang untuk mengembalikan seluruh state uji browser ke data asli.
- Navigasi keyboard tab/pemilih/slider, fokus, label input, reduced motion, dan maskot dekoratif diperiksa. Prettier, ESLint terarah, Next.js typegen, dan TypeScript dipakai untuk pemeriksaan statis.
- Panggilan provider AI, streaming jaringan nyata, pembayaran bank, dan Telegram eksternal tidak dieksekusi. Grafik dengan data penggunaan nyata belum dapat diperiksa karena akun uji belum memiliki log; kondisi kosong diperiksa. Test suite dan production build memerlukan persetujuan pengguna sesuai AGENTS.md.

## Daftar berkas

| Status      | Lokasi                                                                                                                                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Diubah      | `app/dashboard/ai-relay/client-view.tsx`, `components/ai-relay/model-catalog.tsx`, `preset-config-modal.tsx`, `ai-playground.tsx`, `cost-simulator.tsx`, `model-health-monitor.tsx`            |
| Baru        | `app/dashboard/ai-relay/loading.tsx`, `_components/relay-header.tsx`, `relay-tabs.tsx`, `relay-mascot.tsx`, `relay-loading.tsx`, `relay-workspace.module.css`, `_hooks/use-relay-workspace.ts` |
| Baru        | `components/ai-relay/_components/model-catalog-card.tsx`, `playground-messages.tsx`, `playground-telemetry.tsx`, `comparison-model-card.tsx`, `cost-workload-controls.tsx`                     |
| Baru        | `components/ai-relay/_hooks/use-model-catalog.ts`, `use-ai-playground.ts`, `use-cost-simulator.ts`, `_types/playground.ts`, `_data/ide-targets.ts`                                             |
| Aset baru   | `public/images/dashboard/ai-relay/aldera-relay-connect.webp`, `aldera-relay-coding.webp`, `aldera-relay-assistant.webp`                                                                        |
| Dokumentasi | `design-docs/dashboard-ai-relay-ui.md`, `design-docs/dashboard-ai-relay-mascots.md`, `design-docs/README.md`                                                                                   |

Tidak ada berkas yang dihapus. Berkas API Keys, Saldo, Telegram, dan Analitik yang memiliki perubahan lokal sebelum pekerjaan ini tidak diedit oleh redesain ini; tampilannya mengikuti wrapper CSS dashboard.
