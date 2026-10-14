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

Sistem warna Aldera Tech diekstraksi secara presisi dari identitas visual logo resmi untuk memancarkan otoritas teknis, keandalan enterprise, dan modernitas:

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

Mengadopsi hierarki tipografi editorial modern yang menggabungkan otoritas tinggi dan kemudahan membaca (_high legibility_):

1. **Display Headings (Judul Utama & Hero Display)**:
   - Font: **Serif / Slab Display Face** (`font-serif`, Georgia / Playfair Display style) dengan font-weight 800/900 (`font-extrabold`).
   - Warna: Deep Navy (`#0F263A`) pada latar terang, atau Pure White (`#FFFFFF`) pada latar gelap.
   - Memberikan impresi elegan, kredibel, dan berwibawa (_high-authority editorial feel_).

2. **Body Text & Interface Elements**:
   - Font: **Geist Sans** (`font-sans`), sans-serif geometris modern.
   - Warna: Slate 600 (`#475569`) untuk body text umum, Slate 500 untuk caption/keterangan sekunder.

3. **Technical Data & Telemetry**:
   - Font: **Geist Mono** (`font-mono`) untuk kode program, metrik token, ID sistem, dan log terminal.

4. **Massive Stat Callouts (Kalout Metrik Raksasa)**:
   - Angka statistik penting (`98%`, `50+`, `1x24`, `30m`) ditampilkan dalam ukuran font raksasa (`text-6xl` hingga `text-8xl`) menggunakan display serif yang kontras dan eye-catching.

---

## 8. Bahasa Bentuk, Kontainer & Kartu Organik (Shape & Organic Container Language)

Bahasa visual Aldera Tech terinspirasi dari referensi desain visual modern:

1. **Sudut Membulat Lebar (Organic Broad Radii)**:
   - Seluruh kontainer kartu utama menggunakan `rounded-2xl` (16px) hingga `rounded-3xl` (24px) atau `rounded-[2.5rem]` (40px) pada hero showcase dan CTA banner.
2. **Aksen Garis Pil Horizontal (Horizontal Cyan Pill Accent)**:
   - Penanda aksen horizontal berukuran `w-12 h-1.5 bg-[#00B1E1] rounded-full` diletakkan di atas atau di samping judul section sebagai pemandu visual pengunjung.
3. **Tombol Berbentuk Pil (Pill CTA Buttons)**:
   - Tombol aksi utama menggunakan bentuk pil penuh (`rounded-full`) dengan padding nyaman (`px-8 py-3.5`).
4. **Kartu Mengambang Terpusat (Floating Centered Split-Card)**:
   - Pada halaman otentikasi (`/login`, `/register`, `/forgot-password`, `/reset-password`), seluruh alur dibungkus dalam kartu mengambang terpusat (`rounded-3xl`, `shadow-2xl shadow-slate-900/10`) di atas canvas bersih `#F8FAFC`.
   - Sisi kiri: Formulir minimalis berlatar putih dengan input berbingkai halus dan ring Electric Cyan.
   - Sisi kanan: Panel visual rekayasa cloud berlatar Deep Navy `#0F263A`.

---

## 9. Kebijakan Ketat No-Emoji & No-AI-Mascot (Strict No-Emoji & No-AI Policy)

Untuk menjaga reputasi Aldera Tech sebagai konsultan rekayasa perangkat lunak papan atas bagi klien enterprise dan startup bertumbuh:

1. **Larangan Penggunaan Emoji Unicode (Zero Unicode Emojis)**:
   - Dilarang keras menaruh karakter emoji unicode (seperti `👋`, `🎉`, `⏳`, `✓`, `✗`) di antarmuka web, judul halaman, badge status, email template, maupun notifikasi toast.
   - Seluruh indikator status wajib menggunakan **ikon Lucide semantik** (seperti `Clock`, `CheckCircle2`, `Check`, `X`, `Layers`, `ShieldCheck`).
2. **Larangan Maskot Robot AI & Gimmick AI Logo**:
   - Dilarang menampilkan maskot kartun 3D robot AI atau ikon gimmick seperti `Sparkles` untuk merepresentasikan sistem.
   - Seluruh visualisasi teknis wajib merefleksikan rekayasa sistem nyata: topologi arsitektur cloud, mikroservis terdistribusi, telemetri real-time, terminal log, dan dashboard metrik performa.

---

## 10. Standar Format & Performa Aset Gambar (Asset Performance & LCP Optimization)

1. **Format Wajib**: Seluruh aset gambar fotografi, render mockup, dan studi kasus wajib disimpan dalam format **WebP** terkompresi (kualitas 80–85%) atau format vektor **SVG**.
2. **Batas Ukuran Berkas**:
   - Gambar Hero & Showcase: Maksimal `< 100 KB` per berkas.
   - Thumbnail Portfolio & Blog: Maksimal `< 70 KB` per berkas.
   - Ikon & Vektor: Maksimal `< 20 KB` per berkas.
3. **Larangan Berkas PNG Raksasa**: Dilarang menyimpan atau meng-commit gambar PNG uncompressed berukuran megabyte ke dalam repositori publik.
4. **Optimasi LCP (Largest Contentful Paint)**:
   - Elemen gambar kandidat LCP utama (seperti gambar hero di halaman depan) wajib menggunakan atribut `priority` (mengaktifkan `fetchpriority="high"` dan preload).
   - Gambar di bawah viewport (_below the fold_) wajib menggunakan `loading="lazy"` tanpa atribut priority.
