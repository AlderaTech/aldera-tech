# UI AI Gateway / Relay pada dashboard

## Lingkup dan tema

Rute `/dashboard/ai-relay` mengikuti tema [Ringkasan pengguna](dashboard-overview-ui.md), Kalkulator, dan Invoice: Plus Jakarta Sans, navy, biru elektrik, kartu putih solid, border yang terlihat, dan bayangan lembut. Header dan sidebar tetap menggunakan varian studio melalui `getStudioDashboardSection`; navigasi memakai `DASHBOARD_ROUTES.aiRelay` dan aturan akses yang tersedia.

Semua perubahan presentasi dibatasi pada `relay-workspace.module.css`, `relay-patterns.module.css`, dan wrapper rute ini. Token warna lokal memakai permukaan putih, canvas abu-abu kebiruan, border campuran navy 18%, serta teks sekunder navy 72%. Panel tab tidak memiliki frame atau padding tambahan; kartu putih langsung berada di atas latar halaman. Informasi utama memakai 14–16px, judul kartu 16px, serta badge dan label pendukung 12px. Input memakai 16px agar nyaman digunakan pada HP. Warna status transaksi dan model tetap dibedakan dengan label teks.

Corak teknologi terdiri dari grid dan jalur sirkuit di sisi kanan header, orbit berlapis di panel saldo, garis diagonal pada sudut header kartu, serta titik kecil di ujung judul bagian. CSS dekorasi memiliki scope tersendiri pada workspace dashboard dan memakai token `--relay-*` yang tersedia. Pseudo-element berada di belakang isi dengan `pointer-events: none`; tidak menambah tinggi, kontrol, atau animasi. Intensitas turun pada HP dan titik judul bagian disembunyikan. Area isi kartu, pesan chat, kode, tabel, tombol, serta dialog portal tidak diberi corak.

Portal dialog dan dropdown memakai selector `body:has(.workspace)`. Tema tersebut hanya aktif ketika workspace terpasang; primitif UI bersama, dashboard lain, dan AI Relay publik tetap memakai tampilannya masing-masing.

## Header dan navigasi

Header berupa kartu ringkas berisi judul Aldera AI API Relay, deskripsi, mini maskot koneksi, serta panel saldo Rupiah dan tombol Top-up Saldo. Panel saldo desktop memiliki lebar 20rem dan terpisah dari area maskot dengan gap 1.75rem. Angka menggunakan state saldo asli dan `formatCurrency`, tanpa truncation; nominal panjang dapat membungkus. Tombol tetap membuka tab billing. Pada lebar konten maksimal 54rem, panel saldo turun ke baris berikutnya; pada HP, susunannya vertikal. Maskot header disembunyikan pada layar di bawah 480px.

Header aplikasi sticky setinggi 72px tetap berada dalam alur layout bersama. Workspace memakai lebar penuh area konten yang tersedia dan tambahan padding atas 4px, tanpa offset negatif. Track tab, panel aktif, dan kontrol fokus memiliki `scroll-margin-top: 5.5rem` agar navigasi tetap terlihat di bawah header.

Delapan tab tetap memakai Radix Tabs dengan nilai dan urutan asli: `catalog`, `playground`, `keys`, `billing`, `telegram`, `analytics`, `simulator`, `health`. Navigasi selalu satu baris dengan label utuh 14px; track dapat digulir horizontal jika ruang tidak mencukupi. `RelayTabs` menerima `activeTab` dari state yang sama, mengungkap tab aktif saat dipilih atau di-resize, dan mengembalikan track ke area terlihat jika perpindahan dari katalog membuatnya berada di luar viewport. Helper posisi gulir membatasi perpindahan ke panjang track; `ResizeObserver` dibersihkan saat effect dilepas. Navigasi keyboard, query `tab`, alias lama, pemilihan model dari katalog, serta state workspace tetap menggunakan hook yang tersedia.

Label, ikon, dan deskripsi singkat setiap bagian berada dalam `_data/relay-sections.ts`, digunakan bersama oleh navigasi dan `RelaySectionHeading`. Header bagian tidak menambah kontrol atau sumber data baru. Panel nonaktif tetap tersembunyi; panel aktif memakai satu track `minmax(0, 1fr)` agar isi tabel tidak memperlebar seluruh halaman.

## Isi tab

| Tab                  | Presentasi dan batas fungsi                                                                                                                                                                                                                                 |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Katalog Model        | Toolbar putih memisahkan kategori dan pencarian. Kartu 1–3 kolom menampilkan nama, kategori, ID, tarif per 1M token, konteks, kegunaan, dan CTA asli. Harga rata kanan, ID lengkap tetap tersedia untuk salin/title, dan tombol sejajar dalam setiap baris. |
| Playground Chat      | Panel chat terpisah dari telemetri dan informasi model. Mini asisten hanya tampil pada percakapan kosong. Pemilihan model, prompt, status proses/error, pesan, token, biaya, serta callback saldo memakai mekanisme asli.                                   |
| API Keys             | Daftar, masking prefix, dialog pembuatan, penayangan key sekali, dan konfirmasi pencabutan mengikuti tema lokal. Payload, izin, serta tindakan server tidak berubah.                                                                                        |
| Saldo & Ledger       | Saldo, peringatan, riwayat, dialog nominal, tiket pending, kode unik, salin total transfer, dan unggah bukti menggunakan data serta tindakan asli. Klik tombol tidak menandai transaksi selesai.                                                            |
| Telegram Bot         | Instruksi, kode/link, status koneksi, refresh, dan konfirmasi pemutusan menggunakan state serta action yang tersedia.                                                                                                                                       |
| Analitik & Log       | Kartu ringkasan putih, grafik, navigasi grafik, dan tabel log memiliki hierarki yang konsisten. Data, agregasi, filter, dan kondisi kosong mengikuti komponen asli.                                                                                         |
| Komparasi & Simulasi | Pemilih dua model, tiga slider, perbandingan, dan proyeksi memakai parameter serta rumus asli, termasuk perhitungan 30 hari.                                                                                                                                |
| Status & Latensi     | Ringkasan dan tabel memakai data `healthMetrics`. Varian dashboard mempertahankan keterangan Belum ada data dan Lihat status per model, tanpa klaim online atau angka fallback buatan.                                                                      |

Tabel, track tab, blok kode, dan navigasi grafik menampung gulir horizontal secara lokal. Kartu menyesuaikan tinggi isi. Dialog dibatasi tinggi viewport dan memiliki gulir vertikal; tombol tutup berukuran 36px dengan fokus yang jelas. Kontrol utama memiliki tinggi minimal 44px. Dukungan reduced motion tetap tersedia.

Grid katalog memakai satu kolom secara default, dua kolom pada lebar konten minimal 44rem, dan tiga kolom mulai 78rem. Tombol salin ID berukuran 44 × 44px; nilai lengkap tetap disalin dari data asli walaupun teks ID memakai ellipsis. Baris harga dapat membungkus pada HP; CTA memakai dua kolom yang sama besar dan sejajar di bagian bawah kartu. Ringkasan empat metrik pada Analitik dan Status memakai 1/2/4 kolom mengikuti ruang konten. Pilihan nominal cepat pada dialog top-up memakai grid auto-fit dan teks angka tanpa pemenggalan, tanpa mengubah nilai atau perilaku pemilihan.

`RelayLoading` menyediakan skeleton kartu header, delapan slot navigasi dalam satu baris, judul bagian, dan enam kartu katalog. Grid skeleton memakai breakpoint container yang sama dengan katalog akhir.

## Maskot

Tiga aset yang tersedia digunakan kembali tanpa membuat karakter atau gambar pengganti:

- `public/images/dashboard/ai-relay/aldera-relay-connect.webp`: aksen header sekitar 96 × 104px.
- `public/images/dashboard/ai-relay/aldera-relay-coding.webp`: aksen dialog IDE sekitar 96px, disembunyikan pada HP.
- `public/images/dashboard/ai-relay/aldera-relay-assistant.webp`: empty state Playground sekitar 104px.

Aset memiliki alpha transparan, ukuran intrinsik 512 × 512, static import, dan penyajian `next/image` dengan kualitas 90 serta `sizes` responsif. Maskot dekoratif memakai alt kosong, `aria-hidden`, dan `pointer-events: none`. Spesifikasi serta prompt sumber tersedia di [panduan maskot](dashboard-ai-relay-mascots.md).

## Integritas fungsi

Halaman server, autentikasi, query data, hooks workspace/katalog/chat/simulator, dan seluruh action AI Relay tidak termasuk perubahan presentasi ini. Model ID, urutan katalog, tarif, batas konteks, saldo, token, kode unik, nominal transfer, status, serta perhitungan tetap berasal dari implementasi yang tersedia.

Query `tab` tetap disinkronkan ke URL oleh hook workspace. Pencarian dan kategori katalog mempertahankan state lokalnya. Tidak ada endpoint, metode autentikasi, dependensi, variabel lingkungan, atau kebutuhan Docker baru.

## Pemeriksaan

- `bun test app/dashboard/ai-relay`: 23 test lulus dalam tujuh berkas. UI test co-located mencakup header dengan saldo nol dan nominal panjang, keberadaan aset dekoratif, delapan tab dan deep link, heading tiap bagian, empty state, skeleton, panel nonaktif, katalog 48 model dengan ID panjang serta tarif/konteks asli, keterbacaan, nominal top-up, pembatasan CSS portal, serta isolasi corak statis tanpa intersepsi pointer. Test helper gulir mencakup tab yang terlihat, tab di kedua ujung, dan track yang cukup lebar. Pengujian hook sinkronisasi tab tetap dijalankan bersama test UI.
- Preview browser terisolasi merender komponen React asli dengan stylesheet workspace dan corak, data fixture, serta action mock. Delapan tab diperiksa pada desktop dan HP; lebar 320, 390, 768, 1024, sekitar 1440, 1600, dan 1904px diperiksa tanpa overflow halaman. Grid menjadi tiga kolom pada viewport 1600px; tab tetap satu baris dan tab aktif terlihat. Header dimulai di bawah chrome sticky, saldo tidak tertutup maskot, dan tombol salin terukur 44 × 44px. Tabel yang lebar tetap dapat digulir di dalam kartu. Kondisi katalog kosong, nama/ID panjang, saldo nol dan panjang, loading, serta dialog IDE/top-up juga diperiksa. Preview ini tidak menjalankan data fetching route AI Relay atau transaksi asli.
- Interaksi mock mencakup navigasi tab dengan keyboard, pencarian Claude, filter Budget/All, salin ID lengkap, dialog IDE, pemilihan model dari katalog ke Playground, respons/error chat, pembaruan saldo dari callback mock, top-up pending dan nominal, pembuatan key/penayangan sekali, kode binding Telegram, analitik fixture, serta perubahan parameter simulator. Pada parameter prompt 2.000 dan completion 500, perubahan 100 menjadi 110 permintaan/hari menghasilkan Rp712.800 untuk Claude 3.5 Sonnet dan Rp29.040 untuk DeepSeek V3 memakai tarif sumber. Tidak ada panggilan provider, pembuatan key sungguhan, penghubungan Telegram, atau pembayaran dari preview ini.
- ESLint, formatter terarah, Next.js typegen, dan TypeScript lulus. Pengujian tugas UI dibatasi pada test route dan mock. Suite integrasi backend membutuhkan fixture Router DB yang sesuai (`web_user_id` dan kolom binding `telegram_id`); skema, backend, serta environment tidak diubah untuk pemeriksaan ini.
- Provider AI, streaming jaringan nyata, transaksi bank, serta sinkronisasi Telegram eksternal memerlukan lingkungan integrasi tersendiri dan belum diverifikasi oleh pemeriksaan UI ini.

## Tanggung jawab berkas

| Lokasi                                                                                                                                         | Tanggung jawab                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/dashboard/ai-relay/client-view.tsx`                                                                                                       | Susunan header, delapan tab, heading bagian, dan binding komponen fitur yang tersedia.                                                                               |
| `_data/relay-sections.ts`                                                                                                                      | Metadata presentasi tab tanpa mengubah nilai navigasi.                                                                                                               |
| `_components/relay-header.tsx`, `relay-tabs.tsx`, `relay-section-heading.tsx`                                                                  | Header, saldo, navigasi, dan hierarki bagian.                                                                                                                        |
| `_components/relay-loading.tsx`, `relay-workspace.module.css`, `relay-patterns.module.css`                                                     | Skeleton serta tema lokal halaman dan portal.                                                                                                                        |
| `_utils/relay-tab-scroll.ts`, `relay-tab-scroll.test.ts`                                                                                       | Perhitungan posisi gulir tab aktif beserta batas track, tanpa perubahan state navigasi.                                                                              |
| `client-view.test.tsx`, `_components/relay-header.test.tsx`, `relay-tabs.test.tsx`, `relay-section-heading.test.tsx`, `relay-loading.test.tsx` | Rendering, data/URL, aset, skeleton, dan regresi pembatasan layout. Test hook yang tersedia di `_hooks/use-relay-workspace.test.ts` juga dijalankan tanpa perubahan. |

Tidak ada aset yang ditambah atau dihapus. Komponen fitur bersama dan AI Relay publik tidak diedit.
