# Ilustrasi Portofolio Medikare

## Aset aktif

- File: [medikare-hospital.webp](../public/images/portfolio/medikare-hospital.webp).
- Ukuran: 1000 × 1000, WebP kualitas 88, 84.216 byte, latar navy opaque.
- Pembuatan: tool bawaan `imagegen` dalam mode generate, lalu optimasi format dan ukuran dengan Sharp.
- Referensi gaya: [TechNova](../public/images/portfolio/technova-b2b-platform.webp) dan [FinSmart](../public/images/portfolio/finsmart-mobile-app.webp).

Visual merupakan ilustrasi konsep sistem informasi rumah sakit dan telekonsultasi: dashboard penjadwalan, modul rekam medis, telekonsultasi pada ponsel dengan avatar dokter generik, serta koneksi cloud. Visual tidak berisi identitas pasien, data kesehatan nyata, angka hasil bisnis, logo klien, atau sertifikasi. Ini adalah ilustrasi produk, bukan screenshot aplikasi produksi.

Data studi kasus `medikare-cloud-hospital` merujuk `/images/portfolio/medikare-hospital.webp` melalui `featuredImage`. File dipakai oleh gambar pada kartu daftar portofolio dan halaman detail tanpa perubahan query, rute, atau database. Render tetap memakai `next/image` dan ukuran responsif yang sudah tersedia.

## Prompt final

Kedua gambar masukan dipakai sebagai referensi gaya; `transparent_background` bernilai `false`.

```text
Use case: product-mockup. Asset type: square 1:1 premium 3D portfolio illustration for Medikare, an integrated hospital information system and teleconsultation project by Aldera Tech. Input images 1 and 2 are STYLE REFERENCES ONLY: match their sophisticated navy studio setting, crisp three-quarter device perspective, electric-blue and cyan accents, pearly white interface panels, glass layers, soft realistic shadows, and polished technology campaign quality. Create an original healthcare composition: a dominant wide desktop application display with a bright airy hospital management interface composed of an appointment calendar grid, electronic medical record folders, organized scheduling cards and connected modules; next to it a smaller elegant smartphone displaying a teleconsultation interface with a simple generic doctor avatar icon and camera/microphone/call controls. One restrained translucent cloud-and-shield tile and one medical folder tile visually connect the devices, communicating integrated secure hospital software. Use deep navy, electric blue, light cyan, white and cool slate; soft navy-blue gradient studio backdrop and a low premium dark base. Keep all devices fully visible with generous clear margin so they remain legible in a portfolio card. The devices and healthcare UI are the focal point. UI must use abstract unlabeled geometry only. No readable text, no invented patient names or health data, no medical measurements, no performance figures, no client logos, no certification marks, no real doctor portraits, no red-cross emblem, no mascot, no watermark. This is a conceptual product illustration, not a claimed screenshot of a live patient system.
```
