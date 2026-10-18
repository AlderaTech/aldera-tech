# Aldera Tech: Brand Context & Identity Specification

Dokumen ini merupakan panduan tunggal kebenaran (_single source of truth_) identitas brand, filosofi bisnis, panduan komunikasi, serta pedoman visual aset **Aldera Tech** untuk agen kecerdasan buatan (AI / LLM) dan pengembang perangkat lunak.

---

## 1. Company Profile (Profil Perusahaan)

**Aldera Tech** adalah studio rekayasa perangkat lunak papan atas (_high-end software house_), agensi digital (_digital agency_), dan konsultan teknologi modern (_technology consultancy_) yang berbasis di Indonesia.

Aldera Tech berfokus pada perancangan, pengembangan, dan akselerasi platform web berkinerja tinggi, aplikasi mobile lintas platform (cross-platform), sistem enterprise kustom, serta arsitektur cloud terdistribusi. Dengan memadukan metodologi rekayasa modern, transparansi menyeluruh melalui dashboard real-time klien, dan kepedulian mendalam terhadap user experience (UX), Aldera Tech memosisikan diri sebagai mitra teknologi strategis jangka panjang bagi UMKM bertumbuh, startup ambisius, hingga korporasi besar.

### Informasi Bisnis Utama

- **Nama Resmi Brand**: Aldera Tech
- **Nama Pendek**: Aldera
- **Domain & Website**: `https://aldera.tech`
- **Email Kontak**: `hello@aldera.tech`
- **Lokasi**: Jakarta, Indonesia
- **Fokus Layanan**: Web Engineering (Next.js, React, Node.js), Mobile App Engineering (React Native), UI/UX Product Design, Cloud Architecture & DevOps, Konsultasi & Audit Teknologi.

---

## 2. Visi & Misi Perusahaan

### Visi

> **"Menjadi mitra teknologi strategis terdepan dalam merancang, membangun, dan mengakselerasi produk digital berkualitas tinggi dan berkelanjutan."**

### Misi

1. **Rekayasa Perangkat Lunak Berkualitas**: Mengedepankan arsitektur bersih (_clean architecture_), performa tinggi, dan skalabilitas jangka panjang tanpa kompromi kualitas.
2. **Transparansi Radikal**: Menyediakan pelaporan transparan, dashboard progres langsung, dan komunikasi terbuka tanpa celah bagi seluruh mitra bisnis.
3. **Solusi Berorientasi Hasil**: Menghadirkan solusi teknologi tepat guna yang memberi dampak nyata, terukur, dan berkelanjutan terhadap pertumbuhan bisnis mitra.

---

## 3. Core Values (Nilai Inti)

Empat pilar nilai inti yang melandasi seluruh keputusan teknis, etika kerja, dan komunikasi Aldera Tech:

1. **Engineering Excellence (Keunggulan Rekayasa)**:
   - Standar kode tinggi, type-safety menyeluruh, modularitas teruji, dan performa optimal (Core Web Vitals, runtime efficiency).
   - Menolak shortcut atau penumpukan hutang teknis (_technical debt_) yang merugikan klien di masa depan.

2. **Radical Transparency (Transparansi Radikal)**:
   - Tidak ada biaya tersembunyi, invoice tanpa rincian, atau progres yang dirahasiakan.
   - Klien memiliki akses real-time ke timeline milestone, commit aktivitas, log waktu, dan status tiket pekerjaan melalui dashboard terintegrasi.

3. **Agility & Speed (Kelincahan & Kecepatan Eksekusi)**:
   - Siklus rilis iteratif, time-to-market cepat, dan kemampuan beradaptasi dinamis terhadap kebutuhan pasar tanpa mengorbankan stabilitas arsitektur.

4. **Continuous Innovation (Inovasi Berkelanjutan)**:
   - Eksplorasi aktif terhadap ekosistem modern, tooling terkini (Next.js App Router, React Server Components, Turbopack, AI orchestration), serta otomatisasi alur kerja CI/CD.

---

## 4. Tone of Voice & Gaya Komunikasi

Gaya komunikasi Aldera Tech ditujukan kepada para pengambil keputusan (founder, CTO, direktur bisnis, product manager) dengan karakteristik utama:

- **Profesional & Kredibel**: Menggunakan peristilahan teknis dan bisnis yang tepat tanpa terkesan kaku atau jargon yang berlebihan. Berbicara berbasis fakta dan hasil terukur.
- **Percaya Diri & Terpercaya**: Menunjukkan keahlian mendalam dalam arsitektur digital dengan tenang, lugas, dan bertanggung jawab.
- **Modern & Visioner**: Mengadopsi sudut pandang inovatif terhadap masa depan teknologi dan transformasi digital produk.
- **Solutif & Humanis**: Menempatkan kebutuhan bisnis klien sebagai pusat prioritas; menjelaskan kompleksitas teknis dalam analogi yang mudah dipahami mitra.

### Panduan Penulisan Brand & Kata:

- Tuliskan selalu **Aldera Tech** (huruf A dan T kapital dengan spasi tunggal) atau **Aldera** dalam penyebutan kasual/pendek.
- Hindari penulisan seperti `aldera tech`, `Alderatech`, `SOLVO`, atau merujuk nama brand lama.
- Email resmi: `hello@aldera.tech`.

---

## 5. Brand Assets Directory Guide (`public/logo/`)

Direktori `public/logo/` berisi aset identitas visual resmi Aldera Tech yang telah dioptimasi untuk berbagai media dan format:

| Berkas                      | Format & Latar Belakang         | Deskripsi & Komposisi                                                                             | Rekomendasi Penggunaan Utama                                                                                                                                                                           |
| :-------------------------- | :------------------------------ | :------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `logo-transparent.png`      | PNG (Latar Belakang Transparan) | Ikon / simbol logo mandiri (_isolated logo mark_) tanpa teks brand.                               | • Favicon & Apple Touch Icon (`app/layout.tsx`)<br>• Ikon manifest web browser (`app/manifest.ts`)<br>• Komponen `Logo` navbar/header (`components/shared/logo.tsx`)<br>• Avatar brand & badge ringkas |
| `logo-full-transparent.png` | PNG (Latar Belakang Transparan) | Lockup horizontal lengkap (ikon logo di sebelah kiri + tipografi "Aldera Tech" di sebelah kanan). | • Header landing page / public navigation bar<br>• Footer brand banner di atas latar kontras<br>• Presentasi & media kit dengan background transparan                                                  |
| `logo.jpg`                  | JPG (Latar Belakang Solid)      | Ikon logo bujur sangkar (_square icon_) di atas latar belakang solid.                             | • Foto profil media sosial (LinkedIn, GitHub, Instagram)<br>• Ikon katalog aplikasi/listing platform yang tidak mendukung transparansi                                                                 |
| `logo-text.jpg`             | JPG (Latar Belakang Solid)      | Tipografi brand "Aldera Tech" (_wordmark_) mandiri di atas latar solid putih/terang.              | • Header cetak dokumen resmi & proposal PDF formal<br>• Banner email marketing di atas latar belakang netral                                                                                           |
| `logo-text-transparent.png` | PNG (Latar Belakang Transparan) | Tipografi brand "Aldera Tech" (_wordmark_) tanpa ikon, dengan transparansi latar belakang.        | • Watermark dokumen & mockup presentasi produk<br>• Footer inline typography lockup pada background gelap maupun terang                                                                                |
| `logo-full.jpg`             | JPG (Latar Belakang Solid)      | Lockup lengkap (ikon + nama brand) di atas latar belakang solid putih/terang.                     | • Gambar pratinjau media sosial (fallback OpenGraph / Twitter Card)<br>• Header invoice cetak & dokumen formal cetak                                                                                   |

### Aturan Khusus Integritas Aset Visual:

- **Dilarang menggunakan berkas logo lama di root `public/`** karena telah dihapus dan digantikan oleh keluarga varian aset di dalam folder `public/logo/`.
- Komponen web dan metadata wajib mereferensikan aset logo baru dengan path relatif/root: `/logo/logo-transparent.png` atau varian yang sesuai.

---

## 6. Sistem Desain & Token Warna (Design System & Color Tokens)

Beranda memakai komposisi terpusat dengan maskot, tipografi besar, gradasi biru muda dan putih, serta panel konsultasi navy. Tentang memakai Hero dua kolom dengan pose maskot berbeda. Keduanya memakai palet bersama melalui kelas CSS Module `studioTheme` pada `public-shell.module.css`, yang hanya aktif pada `PUBLIC_ROUTES.home` dan `PUBLIC_ROUTES.about`. Halaman publik lain mengikuti styling aplikasinya.

### Palet Bersama Beranda dan Tentang

| Token               | Nilai     | Penggunaan                             |
| :------------------ | :-------- | :------------------------------------- |
| `--home-ink`        | `#102651` | Headline, panel konsultasi, teks utama |
| `--home-blue`       | `#245FE5` | Wordmark besar, tombol, garis dekorasi |
| `--home-blue-hover` | `#174DC7` | Hover tombol biru                      |
| `--home-sky`        | `#E6F0FC` | Dasar navbar Beranda dan Hero          |
| `--home-ice`        | `#E7ECF3` | Transisi biru muda ke abu-abu          |
| `--home-slate`      | `#DCE4ED` | Akhir gradasi banner konsultasi        |
| `--home-slate-deep` | `#CFD9E6` | Aksen slate dan kartu rekayasa         |
| `--home-paper`      | `#FFFFFF` | Kanvas, kartu, cekungan, teks footer   |
| `--home-soft`       | `#F5F8FD` | Latar bagian layanan dan portfolio     |
| `--home-muted`      | `#5C6D86` | Deskripsi dan label sekunder           |
| `--home-line`       | `#DCE5F2` | Border dan pemisah ringan              |

Token brand dan primary diwariskan dari palet studio hanya di dalam wrapper Beranda dan Tentang tersebut. Tombol biru memakai teks putih; navigasi, CTA, dan tautan detail memiliki indikator fokus keyboard.

### Palet Dasar Aplikasi

| Token Desain                      | Kode Hex / Variabel              | Peran & Penggunaan Visual                                                             | Standar Kontras (WCAG 2.1)                               |
| :-------------------------------- | :------------------------------- | :------------------------------------------------------------------------------------ | :------------------------------------------------------- |
| **Deep Navy (Brand Dark)**        | `#0F263A` / `--brand-navy`       | Warna dasar brand dark, teks judul utama, kontainer kartu dark, dan sidebar navigasi. | Kontras **11:1+** terhadap putih (`#FFFFFF`)             |
| **Deep Navy Light**               | `#1A3B54` / `--brand-navy-light` | State hover untuk elemen dark, gradien sekunder dark tech.                            | Kontras tinggi                                           |
| **Electric Cyan (Brand Primary)** | `#00B1E1` / `--primary`          | Warna aksen utama, tombol CTA primer, indikator aktif, dan aksen garis pil.           | Kontras **7.8:1** terhadap teks `#0F263A` (**WCAG AAA**) |
| **Cyan Hover / Active**           | `#0094BD` / `--primary-hover`    | State hover dan active pada tombol Electric Cyan.                                     | Kontras tinggi                                           |
| **Canvas Light**                  | `#F8FAFC` / `--background`       | Warna latar belakang kanvas halaman publik dan workspace auth.                        | Latar terang bersih                                      |
| **Surface White**                 | `#FFFFFF` / `--card`             | Latar belakang kartu, modal dialog, formulir input, dan popover.                      | Kontras maksimum                                         |
| **Divider / Border**              | `#E2E8F0` / `--border`           | Garis pemisah struktural, batas input, dan border kartu minimalis.                    | Border halus                                             |

### Aturan Kontras Tinggi (High Contrast Rule)

- **Tombol Primer Electric Cyan**: Wajib menggunakan teks tebal Deep Navy (`bg-[#00B1E1] text-[#0F263A] font-bold`) dengan rasio kontras 7.8:1 (memenuhi standar WCAG AAA). Dilarang menggunakan teks putih pada latar `#00B1E1` karena rasio kontrasnya hanya 2.4:1.
- **Tombol Dark**: Menggunakan latar Deep Navy dengan teks putih dan hover ke navy light (`bg-[#0F263A] text-white hover:bg-[#1A3B54]`).
- **Elemen Interaktif Dark**: Menggunakan aksen glow Electric Cyan (`#00B1E1`) di atas canvas Deep Navy (`#0F263A`) dengan rasio kontras tajam > 11:1.

---

## 7. Sistem Tipografi (Typography System)

Mengadopsi hierarki tipografi sans-serif modern dengan headline tegas dan keterbacaan tinggi:

1. **Beranda & Public Shell**:
   - Font: **Plus Jakarta Sans** untuk headline, body text, navigasi, dan footer.
   - Headline menggunakan bobot 700–800; body text memakai bobot 400–600 untuk menjaga hierarki dan keterbacaan.
   - Warna teks menggunakan Deep Navy pada latar terang dan putih pada panel Deep Navy.

2. **Technical Data & Telemetry**:
   - Font: **Geist Mono** (`font-mono`) untuk kode program, metrik token, ID sistem, dan log terminal.

3. **Ringkasan Layanan Beranda**:
   - `HomeSummary` menampilkan badge studio, judul sentence case "Dari ide menjadi pengalaman digital" dengan aksen biru, serta deskripsi asli yang menekankan website, aplikasi mobile, dan pengalaman digital. Deskripsi dipasangkan dengan tiga keunggulan: rekayasa yang terarah, proses yang terstruktur, serta kolaborasi transparan.
   - Tiga keunggulan disajikan sebagai kartu berikon dengan nomor urut dekoratif; kartu rekayasa memakai gradasi biru es ke slate lebih pekat (`--home-sky`, `--home-ice`, `--home-slate-deep`) dengan teks navy, dua lainnya putih dengan glow biru lembut. Judul bagian memakai `h2`, judul keunggulan `h3`, dan kartu merupakan artikel tanpa focus stop atau perilaku tombol tambahan. Konten keunggulan mengikuti daftar asli pada `home-summary.tsx`.
   - `home-summary.module.css` hanya diimpor oleh bagian ringkasan Beranda. Desktop memakai teks di kiri dan kartu di kanan dengan indent ringan bergantian; tablet menempatkan judul/deskripsi berdampingan di atas tiga kartu sejajar, sedangkan mobile menumpuk teks dan kartu. Reveal memakai komponen motion bersama; hover dinonaktifkan saat reduced motion aktif. Bagian layanan berikutnya serta halaman lain memakai styling masing-masing.
   - Angka proyek, kepuasan, dan retensi tidak ditampilkan karena tidak berasal dari data bisnis terverifikasi. Klaim numerik baru harus memiliki sumber sebelum ditampilkan.

---

## 8. Bahasa Bentuk, Kontainer & Kartu Organik (Shape & Organic Container Language)

Bahasa visual Aldera Tech terinspirasi dari referensi desain visual modern:

1. **Sudut Membulat Lebar (Organic Broad Radii)**:
   - Kartu utama Beranda menggunakan radius 16–24px; panel CTA memakai 24px. Border slate tipis dan shadow lembut menjaga hierarki tanpa efek gelap berlebihan.
2. **Aksen Garis Pil Horizontal (Horizontal Cyan Pill Accent)**:
   - Penanda aksen horizontal berukuran `w-12 h-1.5 bg-[#00B1E1] rounded-full` diletakkan di atas atau di samping judul section sebagai pemandu visual pengunjung.
3. **Tombol Berbentuk Pil (Pill CTA Buttons)**:
   - Tombol aksi utama menggunakan bentuk pil penuh (`rounded-full`) dengan padding nyaman (`px-8 py-3.5`).
4. **Halaman Autentikasi**:
   - Halaman Login memakai komposisi dua kolom: panel branding bergradasi dengan [maskot khusus Login](../design-docs/login-mascot.md) berpose membawa kartu akses, dan panel formulir terang. Maskot besar menjadi fokus panel kiri; headline ringkas “Ide Anda. Kita wujudkan bersama.” berada di bawah ilustrasi pada desktop. Tampilannya memakai palet biru, slate, putih, dan cyan serta font Plus Jakarta Sans. Pada HP, branding diringkas menjadi logo agar formulir segera terlihat; ukuran teks input 16px dan tombol visibilitas password berukuran 44px. Judul utama berada pada formulir, pesan kesalahan sistem ditampilkan di dekat input, dan animasi maskot mengikuti pengaturan reduced motion. Styling lokal Login tidak mengubah layout autentikasi bersama.
   - Halaman Register mengikuti komposisi dan stylesheet Login melalui impor read-only, dengan maskot khusus membawa kartu akun, judul formulir yang jelas, serta lima field asli. Password dan konfirmasinya memiliki tombol visibilitas mandiri berukuran 44px. Branding diringkas menjadi logo pada HP; formulir tetap mengalir mengikuti tinggi konten. Validasi server, pembuatan akun, OTP WhatsApp, dan redirect dipertahankan. Struktur komponen, aset, dan prompt tersedia di [Panduan UI Register](../design-docs/register-ui.md).
   - Halaman Lupa Password mengikuti layout Login/Register dengan maskot pembawa kunci, panel gradasi terang, dan formulir email ringkas. Pesan sukses serta error memakai respons sistem, tanpa membuka status pendaftaran email; mekanisme aktif mengirim tautan reset melalui WhatsApp berdasarkan email akun. Styling lokal dan impor read-only stylesheet Login menjaga halaman lain tetap sama. Rincian implementasi dan aset tersedia di [Panduan UI Lupa Password](../design-docs/forgot-password-ui.md).
   - Halaman Reset Password dan Verifikasi OTP memakai kartu autentikasi bersama di atas canvas `#F8FAFC`, dengan formulir minimalis dan panel visual rekayasa cloud berlatar Deep Navy `#0F263A`.
5. **Navigasi & Footer Beranda, Tentang, Layanan, Portofolio, AI Relay, dan Harga**:
   - `PublicShell` menerima navbar dan footer sebagai slot React dari layout publik; `usePathname` hanya menentukan wrapper visual aktif. Fetch session dan pengaturan footer tetap berjalan di server.
   - Beranda, Tentang, Layanan, Portofolio, AI Relay, dan Harga memakai navbar kaca melayang yang sama dengan container 1280px, delapan menu, Masuk, dan pill Konsultasi biru. Menu desktop berada pada track pill dengan penanda aktif; tombol konsultasi memiliki ikon panah dan Sheet memakai panel membulat. Latar di belakang navbar mengikuti awal hero; saat scroll, pembungkusnya transparan dan panel lebih pekat. Variasi ini dibatasi melalui pemeriksaan rute publik tersebut dan `studio-navbar.module.css`. Daftar menu desktop/mobile dirender oleh `NavbarLinks`; state Sheet, session, dan UserMenu mempertahankan perilaku aplikasi.
   - Footer Beranda, Tentang, Layanan, Portofolio, AI Relay, dan Harga memakai panel ringkas selebar halaman dengan gradasi biru muda ke abu-abu dari token `--home-sky`, `--home-ice`, dan `--home-slate`, selaras dengan banner konsultasi serta bagian terang halaman. Sudut atas footer tetap membulat; wash slate di kiri dan glow biru di kanan beropacity rendah membantu membedakan footer dari area putih di atasnya. Isi tiap baris memakai container 1280px dengan gutter 20px/32px yang sejajar dengan konten utama. Baris pengenal studio diikuti deskripsi brand 14px serta kelompok Perusahaan, Sumber Daya, dan Kontak yang sejajar tanpa padding kartu terpisah. Heading dan logo memakai navy, teks sekunder memakai navy transparan, garis tipis, serta tombol konsultasi biru berikon panah membentuk hierarki visual. Padding vertikal dan jarak antartautan rapat; area sentuh menyesuaikan perangkat pointer kasar. Wordmark dekoratif maksimal 72px memakai `brandName` dari pengaturan situs; copyright dan keterangan Indonesia berada pada baris penutup tersendiri. Ikon sosial memakai permukaan putih transparan dengan hover lebih terang; fokus keyboard memakai outline biru. Seluruh tautan/kontak/sosial aktual dipertahankan. Styling berada pada `studio-footer.module.css` dan diaktifkan hanya melalui class `scope` pada wrapper footer `PublicShell`. Elemen studio tambahan disembunyikan pada rute lain. Query, fallback, penyaringan sosial, serta pembentukan URL email/WhatsApp mengikuti implementasi footer yang sama.
6. **Komposisi Beranda**:
   - Setiap section Beranda dipisahkan garis horizontal 1px menggunakan token `--home-line`, mengikuti pemisah pada halaman Tentang. Garis diterapkan melalui `home-sections.module.css` pada pergantian section saja, tanpa mengubah halaman publik lain.
   - Hero menampilkan wordmark dekoratif ALDERA TECH, tepat satu maskot transparan di tengah, kartu teknologi di kiri, tumpukan mockup di kanan, tiga badge layanan, dan garis koneksi tipis.
   - Di bawah maskot terdapat tautan Mulai Proyek menuju Kontak dan headline BANGUN IDE. WUJUDKAN SOLUSI DIGITAL. Latar Hero melengkung lebih rendah di tengah dan menyatu dengan kanvas putih.
   - Ringkasan studio diikuti pengenalan layanan dua kolom dengan ilustrasi produk digital transparan, banner konsultasi navy, daftar layanan, bento tantangan, portfolio, testimonial, dan footer.
   - Bagian Tantangan & Solusi memakai headline dua tingkat, pengantar dua kolom, latar kisi teknis berkontras rendah, serta empat kartu bento pada grid 12 kolom. Kartu Siklus Rilis memakai gradasi biru es ke slate, kartu Transparansi Biaya memakai aksen biru muda, sedangkan kartu Arsitektur dan Kualitas memakai permukaan putih lembut. Ikon, nomor urut, daftar cek, dan panel deliverables mengikuti token biru/navy. Semua gaya berada di `home/features-section.module.css`; hover halus dinonaktifkan untuk `prefers-reduced-motion`.
   - `ServicesIntro` memakai gradasi biru muda/putih selebar bagian yang memudar ke bagian putih di sekitarnya. Pada desktop, ilustrasi produk berada di kiri dan copy/CTA di kanan; pada tablet kecil dan mobile, urutan kembali menjadi teks lalu gambar. Layout tidak memakai panel inset, border, atau permukaan kartu. Badge kompas "Dirancang untuk langkah berikutnya", judul sentence case beraksen biru pada kata pertumbuhan, serta deskripsi asli dengan penekanan strategi, desain, dan rekayasa dipertahankan. Tombol Jelajahi Layanan menuju `PUBLIC_ROUTES.services`; Lihat Portfolio menuju `PUBLIC_ROUTES.portfolio` dengan tampilan tautan sekunder berikon panah.
   - `ServicesShowcase` memakai ilustrasi 3D laptop, smartphone, dan panel desain/kode dari `public/images/home/aldera-digital-products.webp`. Aset WebP transparan 1200 × 800 dibuat dengan tool bawaan imagegen; prompt dan spesifikasi tersimpan di [services-artwork.md](../design-docs/services-artwork.md). Ini merupakan ilustrasi layanan, bukan bukti dashboard atau metrik klien. Tiga badge kaca Web Development, UI/UX Design, dan Mobile Apps merupakan elemen HTML. Gambar memakai static import, object-contain, kualitas 90, lazy loading, dan `sizes` responsif. Bayangan lembut membantu kedalaman tanpa bingkai gambar. Semua styling dibatasi pada `services-intro.module.css`; floating gambar/badge hanya aktif ketika reduced motion tidak diaktifkan.
   - Banner konsultasi memakai cekungan setengah lingkaran putih dengan gambar globe 3D transparan yang melewati tepi panel. Panel memakai gradasi bersama `--home-sky`, `--home-ice`, dan `--home-slate`, selaras dengan Hero dan kartu rekayasa; glow radial memakai aksen `--home-slate-deep`, kisi berkontras rendah, garis orbit lembut, dan bayangan biru tipis. Teks gelap dan tombol biru menjaga keterbacaan di atas permukaan terang. Animasi glow berlangsung perlahan dan berhenti untuk prefers-reduced-motion. Tombol Diskusikan Proyek Anda menuju Kontak, sedangkan Hitung Estimasi Harga menuju Harga.
   - `ServicesPreview` menampilkan judul "Enam Jalur Layanan, Satu Standar Rekayasa." dengan aksen biru, deskripsi asli, dan tautan Lihat Semua Layanan di atas grid. Header memakai hierarki editorial: di desktop, deskripsi dan tautan diletakkan lebih rendah dari label Keahlian studio agar sejajar dengan area judul, dengan offset tambahan setengah rem; keduanya dipisahkan dari judul oleh garis tipis. Pada layar kecil susunan menjadi vertikal dengan pemisah horizontal. Enam kartu bergambar tersusun tiga kolom pada layar desktop umum, dua tablet, dan satu HP; mulai 1280px komposisi kartu menjadi mozaik lebar dengan pola 5/4/3 kolom dan tinggi ilustrasi bervariasi. Empat standar pengerjaan berada pada baris ringkas di bawah grid. Ilustrasi layanan memakai WebP transparan 1200 × 800 yang sama dengan halaman Layanan. Pemetaan berdasarkan slug berada pada `lib/service-artwork.ts`, sehingga urutan data dapat berubah tanpa menukar gambar; slug lain memakai ikon asli. `ServicePreviewCard` mempertahankan judul/ringkasan serta tautan `PUBLIC_ROUTES.contactWithService(slug)`. Query aktif, urutan, batas enam item, resolver ikon, dan fallback tetap berjalan di `ServicesPreview`. Gradasi putih/biru, hover lembut, dan fokus keyboard dibatasi pada `services-preview.module.css`; reduced motion menonaktifkan gerakan. Prompt dan spesifikasi aset tersedia di [service-cards-artwork.md](../design-docs/service-cards-artwork.md).
   - `PortfolioPreview` mengangkat studi kasus pertama sebagai kartu editorial lebar dengan gambar dan detail berdampingan, lalu menampilkan studi lainnya dalam kartu pendamping. Badge industri, klien, tautan detail, dan metadata berasal dari data aktual/fallback yang sama. Layout menumpuk pada mobile; hover/fokus dan pengurangan gerak ditangani di `portfolio-preview.module.css`.
   - Bagian testimoni diawali panel ringkas tentang kepercayaan klien dengan headline beraksen biru dan alur Scope, Sprint, dan Rilis. Kartu testimoni memakai gradasi biru-es, rating, dan identitas klien. Garis kisi pada latar section dibuat transparan di belakang carousel agar transisi kartu yang masuk dan keluar terasa lebih bersih. Kartu bergerak terus-menerus dalam loop otomatis; navigasi manual dan indikator slide tidak ditampilkan. Tersedia kontrol jeda/putar, gerakan berhenti saat pointer berada di atas kartu, dan pengguna dengan `prefers-reduced-motion` melihat kartu statis dalam grid. Query Prisma, fallback, dan konten testimoni tetap dipertahankan; styling terlokalisasi pada `testimonials.module.css`.
7. **Responsivitas & Gerakan**:
   - Container maksimum 1280px, padding horizontal 20px pada mobile dan 32px mulai tablet. Heading memakai bobot 800, tracking rapat, dan ukuran responsif.
   - Pada mobile, kartu samping dan tumpukan mockup Hero disembunyikan. Maskot, badge kecil, CTA, serta headline tetap terlihat tanpa menutupi wajah. Pengenalan layanan dan ringkasan tersusun vertikal.
   - Float maskot, mockup, dan globe mengikuti `prefers-reduced-motion`. Reveal menggunakan komponen motion bersama; elemen dekoratif tidak menjadi target fokus.

8. **Komposisi Tentang**:
   - Hero memakai panel dua kolom dengan sudut membulat, judul sentence case yang seimbang, deskripsi terukur, serta satu maskot pembawa laptop dengan gestur tangan terbuka. Gradasi, garis tipis, dan badge transparan mengikuti bahasa visual Beranda.
   - Foto studio ditempatkan pada bagian cerita yang dibagi menjadi tiga blok: tantangan, prinsip, dan perjalanan bersama mitra. Visi dan tiga misi bersumber dari bagian 2 dokumen ini dan ditampilkan dalam dua kartu. Nilai perusahaan tampil dalam kartu terang; kartu Craft yang serius, kategori Frontend, dan CTA penutup memakai gradasi biru-es ke abu-abu dengan teks navy agar selaras dengan panel Visi. Daftar teknologi memakai kategori dan data Prisma yang sudah ada.
   - CTA kontak dan portfolio memakai konstanta rute. Konten cerita, daftar nilai, query teknologi, fallback, serta tujuan tombol dipertahankan.
   - Container, heading, tombol, dan section memakai stylesheet bersama `app/(public)/_components/studio.module.css`. Gaya khusus Tentang berada di `about/_components/about.module.css`.
   - Maskot Tentang: [aldera-cat-about.webp](../public/images/about/aldera-cat-about.webp), 1024x1536, 207.612 byte, WebP kualitas 90 dan alpha kualitas 100. Pose membawa laptop dan gestur perkenalan mempertahankan identitas kucing, headphone, kacamata, hoodie, celana pendek, dan sneakers. Aset dibuat dengan tool bawaan imagegen dan dikompresi dengan Sharp. Gambar memakai static import, preload, dan sizes responsif. Float mengikuti prefers-reduced-motion.

9. **Komposisi Portofolio**:
   - Halaman daftar `/portfolio` memakai hero terpusat dengan judul asli, deskripsi asli, dan maskot kucing putih di depan judul besar, serta dua panel proyek di sisi kiri dan kanan. Tubuh maskot terlihat utuh tanpa panel di depannya. Panel memuat gambar studi kasus dari data terpublikasi sebagai elemen HTML terpisah; grid mempertahankan semua item, klien, industri, ringkasan, teknologi, dan tautan detail dari query/fallback yang sudah ada. Latar halaman, navbar kaca, footer, jarak, kartu, dan fokus keyboard mengikuti token studio. Rincian aset, responsivitas, dan sumber data tersedia di [portfolio-ui.md](../design-docs/portfolio-ui.md).
   - Detail `/portfolio/[slug]` memakai navbar serta footer studio yang sama, hero dua kolom dengan gambar utuh, kartu Tantangan/Solusi/Hasil, panel teknologi, serta CTA biru es ke slate. Judul, klien, industri, ringkasan, cerita, dan teknologi tetap bersumber dari data studi kasus. Pada layar kecil seluruh konten tersusun vertikal; gaya khusus detail berada di `portfolio-detail.module.css`.

---

## Ringkasan pengguna

Rute `/dashboard` memakai workspace terang dengan aksen biru elektrik, kartu pastel, dan tipografi Plus Jakarta Sans. Sidebar ringkas dengan penanda pill serta header ringan dipakai pada Ringkasan, daftar `/dashboard/projects`, riwayat `/dashboard/orders`, `/dashboard/calculator`, `/dashboard/ai-relay`, dan `/dashboard/invoices`; rute lain mempertahankan tampilannya masing-masing. Sambutan mengambil identitas sesi, tiga kartu statistik memakai query asli, onboarding menampilkan seluruh langkah yang belum tuntas, dan aktivitas memakai timeline. Mini maskot menggunakan aset Register yang sama. Detail batas perubahan dan sumber data tersedia di [Panduan UI Ringkasan pengguna](../design-docs/dashboard-overview-ui.md).

Daftar Proyek Saya memakai grid kartu responsif dengan status pastel, judul lengkap, progres serta tanggal dari data asli, dan tautan detail. Empty state menggunakan mini maskot Tentang; loading lokal serta pesan kegagalan memuat data dibedakan dari proyek kosong. Tema tidak diterapkan pada halaman detail. Rincian komponen dan pemeriksaan tersedia di [Panduan UI Proyek Saya](../design-docs/dashboard-projects-ui.md).

Pesanan & Estimasi memakai kartu riwayat dengan jenis proyek dan status di kiri, nominal estimasi di kanan, serta tanggal, jumlah fitur, dan catatan di bawahnya. Satu CTA Estimasi Baru berada pada header; empty state memakai mini maskot Layanan. Query, nominal, jumlah fitur, status, dan alur kalkulator tetap mengikuti sumber asli. Rincian tersedia di [Panduan UI Pesanan & Estimasi](../design-docs/dashboard-orders-ui.md).

Kalkulator dashboard memakai konfigurasi lima tahap dalam kartu putih dan ringkasan biaya bergradasi biru es di sebelah kanan. Stepper bernomor membedakan tahap aktif, selesai, dan berikutnya tanpa membuat navigasi pintas. Jenis proyek memakai ikon dari data dan penanda Terpilih berdasarkan state; ringkasan menunggu pilihan awal sebelum menampilkan total dan DP. Varian publik Harga, rumus, sumber harga, dan pengajuan tetap menggunakan mekanisme yang sama. Rincian tersedia di [Panduan UI Kalkulator](../design-docs/dashboard-calculator-ui.md).

AI Gateway / Relay dashboard memakai header ringkas dengan saldo dan mini maskot koneksi, delapan tab yang dapat digulir, kartu model, chat dan telemetri, serta dialog dengan tema studio. Tiga aset baru ber-alpha mengambil referensi maskot Beranda: koneksi, coding untuk IDE, dan asisten Playground. Tarif, token, saldo, provider, key, top-up, dan sumber data memakai mekanisme asli. Gaya portal dibatasi ke halaman ini. Detail tersedia di [UI dashboard AI Relay](../design-docs/dashboard-ai-relay-ui.md) dan [aset serta prompt](../design-docs/dashboard-ai-relay-mascots.md).

## 9. Maskot Brand & Ikon Antarmuka

Halaman Harga memakai tema studio pada rute publiknya, kartu paket dari sumber harga asli, penanda unggulan berdasarkan `featured`, mini maskot menunjuk dari aset Visi, serta FAQ dan kalkulator dengan tampilan yang konsisten. Varian `appearance="studio"` membatasi styling kalkulator pada Harga; kalkulator dashboard memakai varian `appearance="dashboard"`. Nominal, perhitungan, parameter pemilihan paket, pengajuan, dan integrasi pembayaran mengikuti implementasi yang sama. Struktur komponen dan batas fungsi tersedia di [Panduan UI Harga](../design-docs/pricing-ui.md).

Halaman publik AI Relay memakai navbar dan footer studio yang sama melalui pemeriksaan rute khusus di `PublicShell` dan `Navbar`. Latar hero menyatu dengan gradasi di belakang navbar. Katalog model dinamis, preset IDE, salin konfigurasi, kalkulator, dan tautan akun dipertahankan. Dua mini maskot dekoratif menjadi aksen pada panel koneksi dan konfigurasi; satu disembunyikan pada layar kecil. Struktur, batas fungsi, aset, serta prompt final tersedia di [Panduan UI AI Relay](../design-docs/ai-relay-ui.md).

Halaman Blog dan detail artikel memakai tema studio yang sama pada rute `/blog` dan `/blog/[slug]`. Hero Blog menampilkan mini maskot kucing membaca; daftar artikel memakai kartu responsif, kategori, pencarian GET, dan pagination dari data asli. Detail artikel memakai area baca terukur, daftar isi, serta gaya konten kaya. Rincian tampilan, batas fungsi, dan aset tersedia di [Panduan UI Blog](../design-docs/blog-ui.md).

Untuk menjaga reputasi Aldera Tech sebagai konsultan rekayasa perangkat lunak papan atas bagi klien enterprise dan startup bertumbuh:

Hero menampilkan tepat satu maskot kucing putih 3D: hoodie dan celana pendek putih bergaris merah-biru, headphone hitam besar beraksen biru, kacamata hitam, serta sneakers futuristik. Karakter berdiri dengan satu tangan menyapa dan menyatu dengan kanvas terang melalui alpha transparan.

- **Aset aktif**: [aldera-cat-hero.webp](../public/images/hero/aldera-cat-hero.webp), 1024×1536, 208.078 byte, WebP kualitas 90 dengan alpha kualitas 100. Resolusi sumber dipertahankan untuk layar berkerapatan piksel tinggi.
- **Pembuatan**: tool bawaan `imagegen`; konversi dan kompresi WebP menggunakan Sharp.
- **Penyajian**: static import menghasilkan nama aset berbasis konten untuk invalidasi cache; `next/image` memakai `quality={90}`, `preload`, dan `sizes` sesuai lebar aktual maskot. Gambar layanan dan screenshot portofolio memakai ukuran responsif serta pemuatan lazy; maskot Hero Portofolio memakai preload dan kualitas 90.
- **Badge HTML**: Web Development, Mobile Apps, dan UI/UX Design. Teks tidak dibakar ke gambar.
- **Dekorasi**: garis koneksi SVG dan titik bercahaya, kartu teknologi Lucide, serta mockup dari aset proyek. Kedua globe memakai drop-shadow navy/biru dan bayangan elips lembut di bawahnya. Kartu insight Hero memakai permukaan putih 28%, border putih 45%, serta backdrop blur 8px; transparansi diterapkan pada permukaan agar teks tetap utuh dan terbaca. Globe pada cekungan CTA memakai aset WebP transparan melalui `next/image`; CSS mengatur ukuran, bayangan, dan floating.
- **Aset globe**: [aldera-tech-globe.webp](../public/images/hero/aldera-tech-globe.webp), 512×512, 88.582 byte, WebP kualitas 90 dengan alpha kualitas 100. Dibuat melalui tool bawaan `imagegen`, lalu dikompresi dengan Sharp. Aset dipakai pada banner konsultasi dan kartu insight Hero. Static import mengatur invalidasi cache; gambar dimuat lazy tanpa preload. Banner memakai `sizes` 136px pada mobile dan 160px pada desktop; kartu Hero memakai 64px dengan shadow lembut tanpa lingkaran latar biru. Kartu insight tetap disembunyikan pada layar di bawah 640px.

<details>
<summary>Prompt sumber maskot</summary>

```text
Use case: precise-object-edit. Asset type: premium production website hero mascot cutout for Aldera Tech. Input image: edit target, preserve this single cat's identity. Primary request: refine this exact white 3D cat into a sharper, more polished high-resolution studio render for a professional software engineering company. Keep the same face, white fur, black sunglasses, large black headphones with subtle blue trim, white sporty hoodie with thin red/blue sleeve stripes, one raised welcoming paw, tail, and white sneakers. Replace long trousers with neatly tailored white sporty knee-length shorts matching the hoodie, keeping body proportions natural. Improve clean edge antialiasing, fine fur and fabric detail, crisp headphone surfaces and controlled reflections on glasses. Lighting: large soft studio key and gentle cool fill, white clothing with subtle neutral slate shading and no blown highlights; premium restrained materials. Composition: centered full body, preserve the familiar three-quarter pose and expression, ears and sneakers entirely inside frame with 5 percent clear padding. Portrait 2:3 canvas, at least 1024x1536 if possible, native fine detail suitable for retina screens. Output must have genuine transparent alpha, including around fur and between legs, no background color or checkerboard baked in. Exactly ONE cat, no lettering, no logos, no watermark, no floating badges, no props, no floor plane, no added environment. Keep reference character recognizable and professional, no exaggerated neon effects.
```

</details>

<details>
<summary>Prompt sumber globe banner konsultasi</summary>

```text
Use case: stylized-concept. Asset type: production transparent 3D technology globe cutout for the Aldera Tech software studio website consultation banner. Create exactly ONE premium 3D globe sphere, centered, entire sphere visible, circular silhouette filling approximately 90 percent of a square canvas. Subject: a refined sapphire and electric blue glass globe, subtle recognizable translucent world continents on its surface, elegant thin latitude/longitude meridian lines wrapping naturally around the sphere, and a small number of glowing white/cyan connection nodes with delicate connecting arcs. It should feel sophisticated and dimensional like a high-end product render, not a flat vector icon. Color palette: electric royal blue #245FE5, deep navy #102651, pale ice blue and soft white highlights. Materials: polished translucent blue glass with controlled reflections, subtle depth, crisp fine detail. Lighting: large soft studio key from upper left, gentle blue rim, clear readable silhouette, premium restrained glow. Composition: spherical globe with a slight axis tilt, no stand, no pedestal, no external rings, no extra objects. It must integrate into a white semicircular notch on a navy website panel, so use genuinely transparent alpha outside the object with no opaque backdrop, no ground plane, no baked background shadow. No text, no lettering, no logo, no watermark, no website screenshot. Render at high native resolution, sharp enough for retina display at small UI size.
```

</details>

Prompt dan spesifikasi maskot Tentang terdapat di [Panduan UI Tentang](../design-docs/about-ui.md).

Maskot hero Layanan memakai [aldera-cat-services.webp](../public/images/services/aldera-cat-services.webp), variasi karakter yang sama dengan laptop terbuka dan gestur menjelaskan panel antarmuka. Aset WebP transparan 1024 × 1536 memakai kualitas 90, static import, dan `sizes` responsif. Badge HTML diatur menghindari wajah dan properti laptop; floating mengikuti reduced motion. Referensi identitas, prompt, dan spesifikasi tersedia di [Maskot halaman Layanan](../design-docs/services-mascot.md).

1. **Larangan Penggunaan Emoji Unicode (Zero Unicode Emojis)**:
   - Dilarang keras menaruh karakter emoji unicode (seperti `👋`, `🎉`, `⏳`, `✓`, `✗`) di antarmuka web, judul halaman, badge status, email template, maupun notifikasi toast.
   - Seluruh indikator status wajib menggunakan **ikon Lucide semantik** (seperti `Clock`, `CheckCircle2`, `Check`, `X`, `Layers`, `ShieldCheck`).
2. **Larangan Maskot Robot AI & Gimmick AI Logo**:
   - Dilarang menampilkan maskot kartun 3D robot AI atau ikon gimmick seperti `Sparkles` untuk merepresentasikan sistem.
   - Seluruh visualisasi teknis wajib merefleksikan rekayasa sistem nyata: topologi arsitektur cloud, mikroservis terdistribusi, telemetri real-time, terminal log, dan dashboard metrik performa.

---

## 10. Standar Format & Performa Aset Gambar (Asset Performance & LCP Optimization)

1. **Format Wajib**: Seluruh aset gambar fotografi, render mockup, dan studi kasus disimpan dalam format **WebP** terkompresi (kualitas 80–85% untuk aset umum, 90% untuk maskot Hero dan globe 3D dengan detail halus) atau format vektor **SVG**.
2. **Batas Ukuran Berkas**:
   - Gambar Hero & Showcase: Maksimal `< 100 KB` per berkas.
   - Maskot Hero beresolusi tinggi dengan alpha: maksimal `< 250 KB` untuk menjaga detail pada layar berkerapatan tinggi; respons browser tetap dioptimasi melalui `next/image`.
   - Thumbnail Portfolio & Blog: Maksimal `< 70 KB` per berkas.
   - Ikon & Vektor: Maksimal `< 20 KB` per berkas.
3. **Larangan Berkas PNG Raksasa**: Dilarang menyimpan atau meng-commit gambar PNG uncompressed berukuran megabyte ke dalam repositori publik.
4. **Optimasi LCP (Largest Contentful Paint)**:
   - Elemen gambar kandidat LCP utama (seperti gambar hero di halaman depan) wajib menggunakan `preload` pada Next.js 16.4.
   - Gambar di bawah viewport (_below the fold_) wajib menggunakan `loading="lazy"` tanpa atribut preload.
