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
