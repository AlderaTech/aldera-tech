# UI Kalkulator Estimasi Proyek Aldera Tech

## Cakupan dan komposisi

Rute `/dashboard/calculator` memakai `appearance="dashboard"` pada `CalculatorWizard`. Tema mengikuti Ringkasan, Proyek Saya, dan Pesanan & Estimasi: token `--overview-*`, Plus Jakarta Sans, navy/biru elektrik, putih, gradasi biru es, border tipis, radius membulat, serta tombol pill. `getStudioDashboardSection` mengaktifkan sidebar/header studio dan label Kalkulator Proyek hanya pada rute tepat tersebut. Halaman detail dan dashboard lain mempertahankan tampilannya.

Breadcrumb mempertahankan Dashboard, Riwayat Estimasi, dan Kalkulator Estimasi. Header ringkas memakai judul Kalkulator Estimasi Proyek, deskripsi asli, serta tautan ke riwayat melalui `DASHBOARD_ROUTES.orders`.

Konfigurasi berada di kiri dan ringkasan di kanan mulai 1280px; ringkasan sticky dengan offset header. Pada tablet dan HP keduanya tersusun vertikal. Tidak ada panel scroll bersarang atau tinggi konten yang dikunci. Stepper selalu menampilkan lima label, tanpa tombol lompatan tahap.

## Lima tahap

| Tahap  | Presentasi dan perilaku                                                                                                                                                                                                                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jenis  | Kartu menampilkan ikon berdasarkan `projectType.icon` dengan fallback Layers, nama, deskripsi, dan harga awal asli. `aria-pressed` dan penanda Terpilih mengikuti `selectedType`. Pilihan dapat diaktifkan dengan Enter/Space. Lanjut tetap disabled sebelum memilih.            |
| Skala  | Label, harga per unit, input angka, serta petunjuk minimum disajikan dalam panel. ID, min/max, nilai input, dan pemeriksaan `isInvalid` asli dipertahankan. Petunjuk menjelaskan alasan tombol belum tersedia.                                                                   |
| Fitur  | Checkbox mempertahankan pilihan ganda, nama, harga, penanda Major, disclaimer, dan aturan fitur yang tersedia. Daftar memakai dua kolom ketika area konfigurasi cukup lebar. Input fitur kustom memiliki label terlihat; tambah/hapus dan batas 10 tetap mengikuti handler asli. |
| Add-on | Nama, deskripsi, biaya bulanan, input durasi, batas bulan, serta pilihan Normal/Urgent memakai state asli. Clamp durasi, pengali, dan threshold hari tidak diubah.                                                                                                               |
| Review | Panel spesifikasi menyebut jenis proyek terpilih dan menautkan rincian biaya yang sama. Kebijakan revisi asli, catatan, tanggal peluncuran, Kembali, serta Ajukan Proyek dipertahankan. Tidak ada pengajuan ketika membuka Review atau mengubah konfigurasi.                     |

Perubahan tahap memindahkan fokus ke region konfigurasi dan menyesuaikan posisi scroll di bawah header melalui `useCalculatorStepFocus`. Hook ini hanya aktif pada varian dashboard; tidak mengelola pilihan atau perhitungan. Label status stepper mengumumkan langkah aktif. Fokus kontrol terlihat, pesan minimum terhubung ke input/tombol, dan reduced motion menonaktifkan transisi/animasi dekoratif.

## Ringkasan dan sumber biaya

Sebelum jenis proyek dipilih, ringkasan menampilkan instruksi tanpa total atau DP. Setelah pilihan tersedia, panel menampilkan biaya dasar, skala, fitur, fitur kustom, add-on, urgensi, total, DP, dan catatan konsultasi sesuai sumber lama. Nama rincian dibungkus penuh dan nominal memakai `formatCurrency`.

`use-calculator-wizard.ts`, `lib/calculator.ts`, `lib/calculator-utils.ts`, dan `lib/actions/calculator.ts` tidak diubah. Pengambilan data server, serialisasi, harga dasar, pengali, persentase DP, pembulatan, validasi, payload, autentikasi, dan penghitungan ulang server tetap menggunakan implementasi asli. `getSiteSettings()` dan nomor WhatsApp diteruskan seperti semula. Callback login dan WhatsApp pada varian publik tetap tersedia.

Saat pending, tombol Ajukan Proyek disabled dan menampilkan Mengajukan. Toast error/sukses, layar sukses, reset, serta tautan riwayat mengikuti respons action asli. Reset tetap mempertahankan perilaku state dari hook yang sama. Tidak ada API, rute, env var, dependensi, maupun aset gambar baru.

## Isolasi varian publik

`CalculatorWizard` mendukung `default`, `studio`, dan `dashboard`. Kelas `calculator-dashboard.module.css` hanya dipasang pada varian dashboard. Harga tetap memakai `studio` dengan `pricing-calculator.module.css`; indikator dan gaya publik dipertahankan. Prop `dashboard` pada komponen pilihan, ringkasan, dan tahap bersifat opsional dengan nilai awal false.

## Pemeriksaan

- Kelima tahap diperiksa pada lebar 320, 390, 768, 1024, dan 1440px: tidak ada overflow halaman atau kontrol melewati viewport.
- Lanjut sebelum memilih jenis dan Pilih Fitur ketika skala kosong/nol tetap disabled. Kembali/Lanjut mempertahankan skala, fitur, fitur kustom, add-on, dan urgensi. Durasi add-on tetap clamp ke minimum/maksimum; nol mengosongkan pilihan.
- Aktivasi kartu melalui Enter/Space, navigasi Tab, outline fokus, label input, perpindahan fokus tahap, menu mobile aktif, dan reduced motion diperiksa di browser.
- Keempat jenis proyek tetap menggunakan harga dan parameter skala sumber aktif. Fitur kustom kosong tidak menambah biaya.
- Perbandingan sebelum/sesudah untuk Web App & SaaS, 3 modul, Login/Register, 1 fitur custom, dan Domain + Deploy 3 bulan memberikan hasil identik:

| Prioritas | Total        | DP 25%      |
| --------- | ------------ | ----------- |
| Normal    | Rp15.700.000 | Rp3.925.000 |
| Urgent    | Rp23.550.000 | Rp5.887.500 |

- Pengajuan diperiksa memakai intersepsi browser sebelum POST mencapai server: pending, disabled, pencegahan klik ganda, respons gagal, retry, respons sukses, layar sukses, dan reset. Payload mempertahankan konfigurasi dan total yang sama. Catatan tetap tersedia setelah respons gagal. Jumlah pesanan database sebelum dan sesudah pemeriksaan tetap 0; tidak ada pesanan sungguhan dibuat.
- Varian Harga diperiksa agar tetap memakai tema studio, opsi proyek asli, serta rute yang sama. Verifikasi statis memakai Prettier, ESLint terarah, Next.js typegen, dan TypeScript. Test suite serta build produksi memerlukan persetujuan pengguna sesuai AGENTS.md.

## Berkas antarmuka

| Status      | Berkas                                                                                                                                                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Diubah      | `app/dashboard/calculator/page.tsx`, `components/dashboard/studio-dashboard-routes.ts`                                                                                                                                        |
| Baru        | `app/dashboard/calculator/_components/calculator-page.module.css`                                                                                                                                                             |
| Baru        | `app/(public)/pricing/_components/calculator-stepper.tsx`, `calculator-dashboard.module.css`                                                                                                                                  |
| Baru        | `app/(public)/pricing/_hooks/use-calculator-step-focus.ts`                                                                                                                                                                    |
| Diubah      | `app/(public)/pricing/_components/calculator-wizard.tsx`, `calculator-choice.tsx`, `calculator-summary-sidebar.tsx`                                                                                                           |
| Diubah      | `app/(public)/pricing/_components/calculator-steps/step-project-type.tsx`, `step-details.tsx`, `step-features.tsx`, `step-addons.tsx`, `step-review.tsx`                                                                      |
| Dokumentasi | `design-docs/dashboard-calculator-ui.md`, `design-docs/dashboard-overview-ui.md`, `design-docs/dashboard-projects-ui.md`, `design-docs/dashboard-orders-ui.md`, `design-docs/pricing-ui.md`, `ai-agent-docs/brand-context.md` |

Tidak ada berkas yang dihapus dalam cakupan kalkulator.
