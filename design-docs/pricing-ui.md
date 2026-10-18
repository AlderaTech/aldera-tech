# UI halaman Harga

Halaman publik `/pricing` memakai bahasa visual studio yang sama dengan Beranda, Tentang, Layanan, Portofolio, dan AI Relay: Plus Jakarta Sans, navy, biru elektrik, putih, gradasi biru es/slate, radius membulat, garis pemisah halus, serta tombol pill.

## Komposisi halaman

- Hero mempertahankan judul “Harga transparan, tanpa kejutan” dan keterangan bahwa semua harga mencakup pajak. Tautan Jelajahi Paket menuju `#pricing-plans`, sedangkan Hitung Estimasi memakai `PUBLIC_ROUTES.calculator`.
- Panduan “Rencanakan langkah Anda” berada dalam panel putih transparan di samping hero. Judul panduan memakai 20px, teks langkah 17px, penanda nomor 36px, dan catatan harga 13px. Pada HP judul memakai 18px dan langkah 15px; seluruh judul, langkah, serta catatan tetap terlihat, dengan maskot kecil di sampingnya.
- Kartu paket menampilkan nama, tagline, label Mulai dari, nominal, seluruh fitur, dan CTA dari `PublicPricingPlan`. Fitur termasuk/tidak termasuk dibedakan dengan ikon, teks alternatif untuk pembaca layar, dan legenda. Tombol berada di bawah kartu dengan posisi sejajar pada setiap baris.
- Penekanan “Paket unggulan” hanya muncul ketika `plan.featured` bernilai benar. Tampilan tidak menyimpulkan popularitas, diskon, atau periode pembayaran yang tidak ada pada data.
- Daftar paket memakai satu kolom pada layar kecil, dua kolom mulai 700px, dan tiga kolom mulai 1024px. Kartu terakhir pada baris tablet yang berjumlah ganjil ditempatkan di tengah. Tidak ada tabel perbandingan atau tombol periode pembayaran tambahan.
- Panel bantuan estimasi mempertahankan tujuan kalkulator. Kalkulator memakai pengenal `calculator`, konfigurasi asli, pilihan lima langkah, dan ringkasan biaya yang mengikuti pilihan pengguna.
- FAQ mempertahankan semua pertanyaan/jawaban dari `_constants/pricing-faqs.ts`, termasuk harga awal/final, metode pembayaran, waktu pengerjaan, dan maintenance. Accordion tetap single/collapsible dan tersedia melalui keyboard.
- Navbar serta footer studio aktif khusus pada rute publik Harga. Latar hero dan area di luar navbar memakai gradasi pembungkus yang sama. Pemeriksaan pathname mempertahankan tampilan rute lain.

## Sumber data dan batas fungsi

`page.tsx` tetap memuat `auth()`, `getPricingPlans()`, `getSiteSettings()`, dan query Prisma yang sama melalui `safeDb`. Nominal, urutan, fitur, penanda unggulan, CTA, serta fallback tetap berasal dari `lib/public-settings.ts`. Kartu meneruskan `plan.ctaHref` dan `plan.ctaLabel` tanpa mengganti parameter paket.

`use-calculator-wizard.ts`, `calculateOrderTotal`, `submitOrderRequest`, validasi langkah, ID input, data kalkulator, dan payload pengajuan tetap dipakai. Nilai awal, dependensi proyek, fitur kustom, add-on, pengali urgensi, pembulatan, serta persentase DP mengikuti implementasi dan konfigurasi aktif. Harga paket tidak ditulis ulang sebagai konstanta di komponen tampilan.

Review mempertahankan status autentikasi, tombol pending, toast sukses/error, layar sukses, reset kalkulator, tujuan riwayat estimasi, callback login, dan penyusunan tautan WhatsApp. Perubahan tampilan tidak mengirim transaksi atau permintaan baru.

## Variasi kalkulator dan lingkup CSS

`CalculatorWizard` menerima prop presentasi opsional `appearance` dengan nilai awal `default`. `PricingCalculatorSection` mengirim `appearance="studio"`. Halaman `/dashboard/calculator` memakai `appearance="dashboard"` dengan CSS terpisah, tanpa menerapkan gaya dashboard pada halaman Harga. Rincian tersedia di [Panduan UI Kalkulator dashboard](dashboard-calculator-ui.md). `CalculatorStepper` merender indikator asli untuk varian publik dan stepper bernomor khusus varian dashboard.

Kelas studio hanya diterapkan pada varian tersebut. Token warna, kontrol, progres langkah, pilihan proyek/urgensi, dan sidebar dirapikan melalui `pricing-calculator.module.css`. Warna aksen amber pada modul kalkulator diarahkan ke biru studio dan teks WhatsApp memakai hijau yang cukup gelap pada permukaan terang. Ringkasan menampilkan nama item utuh serta nominal dan total yang mudah dibaca.

`CalculatorChoice` menggunakan Card yang sama dengan callback pilihan asli. Pada varian studio, kartu juga menerima fokus, `aria-pressed`, dan aktivasi Enter/Space; varian default mempertahankan markup serta penanganan klik Card. Informasi kosong jenis proyek tersedia pada varian studio saat sumber data tidak menyediakan pilihan.

## Mini maskot

Hero menggunakan kembali [aldera-cat-vision.webp](../public/images/about/aldera-cat-vision.webp), karakter kucing Aldera yang menunjuk ke arah pilihan. Tidak ada karakter atau aset gambar pengganti.

Gambar memakai static import dan `next/image`, alpha transparan, kualitas 90, dimensi intrinsik, serta sizes responsif. Lebar tampilannya 128px desktop, 92px tablet, dan 72px HP. Alt kosong, `aria-hidden`, dan `pointer-events: none` menjadikannya dekoratif. Floating berhenti pada `prefers-reduced-motion`; efek hover kartu hanya bergerak saat pengaturan motion mengizinkan.

## Pemeriksaan UI

- Snapshot nama, tagline, harga, seluruh fitur, CTA, serta parameter paket dibandingkan dengan halaman sebelum perubahan.
- Pemilihan Starter, Professional, dan Enterprise diteruskan ke `/contact?plan=...` dengan subjek formulir yang sesuai. Formulir tidak dikirim.
- Kalkulator diperiksa dari pilihan jenis proyek melalui review: batas minimum skala, pilihan fitur, tambah/hapus fitur kustom, add-on, prioritas normal/urgent, ringkasan biaya, DP, callback login, serta isi ringkasan WhatsApp.
- Pemeriksaan browser mencakup lebar 320, 390, 768, 1024, dan 1440px, posisi CTA, fokus keyboard, accordion, menu mobile, dan reduced motion.
- Pemeriksaan frontend tidak membuat order, mengirim pesan WhatsApp, atau melakukan pembayaran. State pending/sukses/error dan handler pengajuan tetap menggunakan implementasi asli.
- Lint, Prettier, dan typecheck merupakan pemeriksaan statis. Test suite serta build produksi mengikuti persetujuan pengguna sesuai AGENTS.md.

## Berkas antarmuka

Berkas utama berada di `app/(public)/pricing/_components/`:

- `pricing-hero.tsx`
- `pricing-grid.tsx`
- `pricing-plan-card.tsx`
- `pricing-calculator-section.tsx`
- `pricing-faq.tsx`
- `pricing.module.css`
- `pricing-plans.module.css`
- `pricing-calculator.module.css`
- `calculator-wizard.tsx`
- `calculator-choice.tsx`
- `calculator-summary-sidebar.tsx`
- `calculator-steps/step-project-type.tsx`
- `calculator-steps/step-addons.tsx`

Aktivasi tema publik dibatasi melalui:

- `app/(public)/_components/public-shell.tsx`
- `app/(public)/_components/public-shell.module.css`
- `components/shared/navbar.tsx`
- `components/shared/studio-navbar.module.css`

Panduan visual terkait: [brand-context.md](../ai-agent-docs/brand-context.md). Tidak ada dependensi, env var, rute, atau aset gambar baru.
