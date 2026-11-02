# UI AI Gateway / Relay pada dashboard

## Lingkup dan tema

Rute `/dashboard/ai-relay` mengikuti tema [Ringkasan pengguna](dashboard-overview-ui.md), Kalkulator, dan Invoice: Plus Jakarta Sans, navy, biru elektrik, kartu putih solid, border yang terlihat, dan bayangan lembut. Header dan sidebar tetap menggunakan varian studio melalui `getStudioDashboardSection`; navigasi memakai `DASHBOARD_ROUTES.aiRelay` dan aturan akses yang tersedia.

Presentasi workspace dibatasi oleh CSS Module lokal dan wrapper rute ini. Banner dan segmented tab memakai komponen bersama di components/dashboard; halaman AI Relay publik tetap utuh. Token lokal memakai permukaan putih, canvas abu-abu kebiruan, border campuran navy dan teks sekunder terbaca. Panel tab tidak mempunyai frame bertumpuk; kartu putih langsung berada di atas latar halaman. Informasi utama memakai 14–16px, judul kartu 16px, badge/label 12px dan input 16px.

Banner menggunakan pola titik, grid dan orbit dari WorkspaceBanner. Corak lokal mempertahankan orbit di panel saldo, diagonal di header kartu dan titik judul bagian. Dekorasi statis berada di belakang isi dengan pointer-events: none; area pesan, kode, tabel, tombol dan dialog tetap bersih. Intensitas dikurangi pada HP.

Portal dialog dan dropdown memakai selector `body:has(.workspace)`. Tema tersebut hanya aktif ketika workspace terpasang; primitif UI bersama, dashboard lain, dan AI Relay publik tetap memakai tampilannya masing-masing.

## Header dan navigasi

Header memakai WorkspaceBanner dengan badge Workspace AI Anda berikon Network, judul Aldera AI API Relay, deskripsi serta panel saldo Rupiah dan tombol Top-up Saldo. Saldo memakai state asli dan formatCurrency, tanpa truncation; nominal panjang dapat membungkus. Panel saldo membungkus mengikuti ruang konten, sedangkan maskot mempunyai track kanan terpisah 144px pada desktop, 120px pada tablet dan disembunyikan di bawah 640px. Tombol tetap membuka tab billing.

Header aplikasi sticky setinggi 72px tetap berada dalam alur layout bersama. Workspace memakai lebar penuh area konten yang tersedia dan tambahan padding atas 4px, tanpa offset negatif. Track tab, panel aktif, dan kontrol fokus memiliki `scroll-margin-top: 5.5rem` agar navigasi tetap terlihat di bawah header.

Delapan tab Radix mempertahankan nilai dan urutan asli: catalog, playground, keys, billing, telegram, analytics, simulator, health. WorkspaceTabsList dan WorkspaceTabsTrigger membentuk segmented track selebar container, dengan delapan kolom, empat pada lebar container maksimal 64rem dan dua pada maksimal 36rem. Mode density compact memakai label 12px yang dapat membungkus, ikon 16px, tinggi trigger minimal 36px dan pilihan aktif biru. Default tab Admin/Kalkulator tetap memakai kepadatan standar. RelayTabs tetap menerima activeTab dari state asli; helper scroll, ResizeObserver dan pengungkapan track menjaga tab terlihat di bawah header. Query tab, alias lama, keyboard serta pemilihan model tetap mengikuti hook yang tersedia.

Label, ikon, dan deskripsi singkat setiap bagian berada dalam `_data/relay-sections.ts`, digunakan bersama oleh navigasi dan `RelaySectionHeading`. Judul dan penjelasan bagian berada dalam satu kelompok vertikal yang rapat. Header bagian tidak menambah kontrol atau sumber data baru. Panel nonaktif tetap tersembunyi; panel aktif memakai satu track `minmax(0, 1fr)` agar isi tabel tidak memperlebar seluruh halaman.

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

Toolbar katalog memakai ModelCatalogToolbar sebagai komponen presentasi, dengan state/callback dari useModelCatalog. Khusus workspace dashboard, filter berukuran 30px, font 12px dan padding vertikal 4px; search 36px; padding toolbar 10px x 12px. Input memakai font 16px pada HP. Kontrol tab lain tetap memakai ukuran aslinya.

Grid katalog memakai satu kolom secara default, dua kolom pada lebar konten minimal 44rem, dan tiga kolom mulai 78rem. Tombol salin ID berukuran 44 × 44px; nilai lengkap tetap disalin dari data asli walaupun teks ID memakai ellipsis. Baris harga dapat membungkus pada HP; CTA memakai dua kolom yang sama besar dan sejajar di bagian bawah kartu. Ringkasan empat metrik pada Analitik dan Status memakai 1/2/4 kolom mengikuti ruang konten. Pilihan nominal cepat pada dialog top-up memakai grid auto-fit dan teks angka tanpa pemenggalan, tanpa mengubah nilai atau perilaku pemilihan.

`RelayLoading` menyediakan skeleton header, delapan slot navigasi 36px yang mengikuti grid 8/4/2 kolom, judul bagian, dan enam kartu katalog. Grid skeleton memakai breakpoint container yang sama dengan katalog akhir.

## Ilustrasi maskot & teknologi 3D

Tiga aset digunakan pada workspace AI Relay:

- `public/images/ai-relay/aldera-cat-relay-balance.webp`: maskot kucing 3D Aldera Tech di sebelah kartu Saldo Aktif pada header, berpose melayang sedikit dengan tangan kanan menengadah memunculkan hologram ikon dompet 3D biru bercahaya dan tangan kiri menunjuk/menyapa ke arah kanan (ke arah kartu saldo).
- `public/images/about/technology/web.webp`: aksen dialog IDE sekitar 96px, disembunyikan pada HP.
- `public/images/about/technology/design.webp`: empty state Playground sekitar 104px.

Aset memiliki alpha transparan, ukuran intrinsik 512 × 512, static import, dan penyajian `next/image` dengan kualitas 90 serta `sizes` responsif. Maskot dekoratif memakai alt kosong, `aria-hidden`, dan `pointer-events: none`. Spesifikasi serta prompt sumber tersedia di [panduan maskot](dashboard-ai-relay-mascots.md).

## Integritas fungsi

Halaman server, autentikasi, query data, hooks workspace/katalog/chat/simulator, dan seluruh action AI Relay tidak termasuk perubahan presentasi ini. Model ID, urutan katalog, tarif, batas konteks, saldo, token, kode unik, nominal transfer, status, serta perhitungan tetap berasal dari implementasi yang tersedia.

Query `tab` tetap disinkronkan ke URL oleh hook workspace. Pencarian dan kategori katalog mempertahankan state lokalnya. Tidak ada endpoint, metode autentikasi, dependensi, variabel lingkungan, atau kebutuhan Docker baru.

## Pemeriksaan

Test co-located mencakup header dengan saldo nol/panjang, aset, delapan tab, URL, heading bagian, loading/empty, ID model lengkap, tarif, top-up dan pembatasan tema. Regresi segmented tab memverifikasi jumlah pilihan, status aktif, callback dan ukuran track. Browser memakai komponen asli dengan fixture serta action mock; tidak menjalankan pembayaran atau provider sungguhan. Hasil verifikasi aktif tersedia di [standar visual workspace](workspace-visual-consistency.md).

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

Spesifikasi compact dan hasil verifikasi aktif tersedia di [kepadatan dashboard dan maskot](dashboard-density-and-mascots.md).
