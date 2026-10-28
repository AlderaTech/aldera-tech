# UI Invoice & Pembayaran

## Cakupan dan identitas

Desain berlaku hanya pada daftar `/dashboard/invoices` dan dialog pembayarannya. `getStudioDashboardSection` mengaktifkan sidebar, header, dan token studio untuk rute tepat ini. Rute detail terpisah, checkout eksternal, dan halaman lain mempertahankan tampilannya.

Plus Jakarta Sans, navy/biru, kartu putih solid, border yang terbaca, dan radius mengikuti Ringkasan serta Kalkulator terbaru. Token border 18% navy dan teks sekunder 72% navy dibatasi pada halaman invoice dan dialognya. Pastel dipakai pada ikon dan aksen orbit kecil, bukan seluruh permukaan kartu. Header memakai visual dokumen dekoratif yang disederhanakan pada HP; tidak menambahkan tombol tanpa fungsi. CSS dibatasi melalui module. Portal dialog mendapat `overview-chrome.scope` secara eksplisit agar warna tetap konsisten di luar wrapper halaman.

Corak statis mengikuti Ringkasan dan Kalkulator: grid teknis yang memudar pada sisi kanan header, titik kecil melengkapi orbit pada kartu ringkasan, dan garis diagonal di sudut header daftar. Semua corak memakai token warna lokal, pseudo-element di belakang isi, serta `pointer-events: none`. Baris invoice dan formulir pembayaran tetap bersih. Corak tidak menambah tinggi panel atau animasi.

## Data dan nominal

`InvoicesContent` mempertahankan autentikasi dan query asli: invoice milik `session.user.id`, selain `DRAFT`, urut `issueDate` menurun, termasuk judul proyek. Daftar memakai pagination 10 invoice per halaman dan filter status dari URL. Query ringkasan mengambil seluruh invoice non-draft pengguna, tanpa dibatasi halaman atau filter daftar. Konversi `Number(invoice.total)`, `formatCurrency`, tanggal, ID, URL bukti, dan urutan tidak berubah.

Ringkasan memakai seluruh hasil query, bukan sebagian kartu yang terlihat:

| Kartu               | Status yang dicakup    | Angka                                  |
| ------------------- | ---------------------- | -------------------------------------- |
| Menunggu pembayaran | `SENT`, `OVERDUE`      | Jumlah invoice dan penjumlahan `total` |
| Dalam verifikasi    | `PENDING_VERIFICATION` | Jumlah invoice dan penjumlahan `total` |
| Telah dibayar       | `PAID`                 | Jumlah invoice dan penjumlahan `total` |

`CANCELLED` tetap muncul dalam daftar, tetapi tidak masuk ringkasan tersebut. Label status mengikuti `invoiceStatusMeta`; tanggal browser tidak mengubah `SENT` menjadi `OVERDUE`. Tidak ada tren, grafik, atau statistik buatan. Query gagal memakai fallback `null` untuk menampilkan error dan muat ulang, tanpa ringkasan nol palsu.

## Daftar dan kondisi halaman

- Container daftar selebar minimal 960px menggunakan tabel semantik. Nominal rata kanan; nomor invoice, proyek, tanggal terbit, jatuh tempo, status, dan tindakan tersedia.
- Container lebih sempit menggunakan kartu putih di atas alas biru keabuan; mulai 620px tersedia dua kolom. Nominal memiliki bidang tersendiri dan nama panjang dapat membungkus. Filter `status` tetap menggunakan `ParamFilterSelect` dan mengosongkan parameter halaman ketika diganti; `DataPagination` mempertahankan `page`, total hasil filter, serta parameter URL lainnya. Pencarian dan pengurutan baru tidak ditambahkan.
- Skeleton mengikuti tiga ringkasan dan daftar. Empty state akun tanpa invoice menautkan Proyek Saya. Hasil filter kosong menawarkan tautan reset filter; halaman kosong dengan total hasil lebih dari nol menawarkan halaman pertama sambil mempertahankan status. Ketiganya tidak menyatakan semua tagihan lunas. Penentuan kondisi hanya memakai hasil daftar/total dan parameter status valid yang sudah tersedia, tanpa query tambahan.
- Mini maskot menggunakan [aset asisten AI Relay yang tersedia](../public/images/dashboard/ai-relay/aldera-relay-assistant.webp) melalui static import. Ukuran 120px pada desktop dan 104px pada HP, dekoratif, lazy-loaded, dengan susunan vertikal rata tengah dan corak statis `EmptyStatePattern`. Tidak ada aset baru.

## Pembayaran dan aksesibilitas

- Tindakan pembayaran tetap hanya untuk `SENT`, `OVERDUE`, dan `PENDING_VERIFICATION`; label terakhir tetap **Lihat Bukti**. PDF memakai `API_ROUTES.invoicePdf(id)` dengan atribut `download`.
- Tab awal tetap `manual` jika bukti tersedia; selain itu `midtrans`. Tab mempertahankan state lokal dialog dan tidak mengubah URL, sesuai perilaku asal.
- Midtrans tetap memanggil `createInvoicePaymentSnapAction(invoice.id)`, membuka `redirectUrl` pada tab baru, dan memakai fallback navigasi ketika popup diblokir. Frontend tidak menandai invoice lunas.
- Dua rekening asli beserta nomor, format tampilan, dan pemiliknya dipindahkan tanpa perubahan. Clipboard memberikan feedback berhasil/gagal.
- `proof-file` tetap menerima JPG/PNG/WebP/PDF, maksimal 10MB. `proof-notes` tetap opsional. Bukti lama dapat digunakan tanpa upload baru. PDF lama menjadi tautan dokumen, gambar menjadi preview.
- Upload tetap `POST API_ROUTES.upload` dengan `FormData` bernama `file`. Konfirmasi tetap `submitPaymentProofAction({ invoiceId, proofUrl, notes: notes.trim() })`.
- Hook lokal menangani preview, status pengiriman, guard permintaan ganda, pesan error dekat field/panel, dan pembersihan blob URL. File dan catatan tetap tersedia ketika gagal. Validasi server serta status backend tidak diubah.
- Dialog memakai ringkasan nominal pada bidang lembut, border input yang jelas, tombol pill, dan pemisah bagian. Dialog dapat digulir pada viewport pendek, mendukung fokus keyboard yang terlihat, Escape, dan pengembalian fokus ke pemicu. Reduced motion meniadakan transisi dekoratif dan animasi spinner mengikuti kelas yang sudah ada.

## Berkas implementasi

Path berikut relatif terhadap `app/dashboard/invoices/`, kecuali disebutkan lain.

| Tanggung jawab                           | Berkas                                                                                                                                                                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Data server, metadata, dan suspense      | `page.tsx`, `loading.tsx`, `_components/invoices-content.tsx`                                                                                                                                                      |
| Header, ringkasan, dan kondisi halaman   | `_components/invoices-frame.tsx`, `invoices-summary.tsx`, `invoices-skeleton.tsx`, `invoices-empty-state.tsx`, `invoices-load-error.tsx`                                                                           |
| Filter, pagination, dan daftar responsif | `_components/client-invoices-table.tsx`, `invoice-status-filter.tsx`, `invoice-desktop-table.tsx`, `invoice-mobile-cards.tsx`, `invoice-status.tsx`, `invoice-actions.tsx`                                         |
| Dialog dan panel pembayaran              | `_components/upload-proof-dialog.tsx`, `online-payment-panel.tsx`, `manual-payment-form.tsx`, `payment-bank-accounts.tsx`, `payment-proof-field.tsx`                                                               |
| State dan kontrak asli                   | `_hooks/use-invoice-selection.ts`, `_hooks/use-invoice-payment.ts`, `_types/invoice.ts`, `_data/bank-accounts.ts`, `_utils/invoice-summary.ts`                                                                     |
| Styling lokal                            | `_components/invoices.module.css`, `_components/payment-dialog.module.css`                                                                                                                                         |
| Test                                     | `page.test.tsx`, `_utils/invoice-summary.test.ts`, `_components/invoices-view.test.tsx`, `_components/payment-panels.test.tsx`, `_components/invoices-frame.test.tsx`, `_components/invoices-empty-state.test.tsx` |
| Referensi tema bersama                   | `components/dashboard/studio-dashboard-routes.ts`, `app/dashboard/_components/empty-state-pattern.tsx`                                                                                                             |

Redesain memakai ulang aset dan komponen dekorasi yang tersedia. Kode pengambilan data dan hook pembayaran tetap terpisah dari komponen presentasi.

## Pemeriksaan

- Test pendamping frame dan empty state mencakup batas scope, urutan maskot/teks, aset yang tersedia, reset filter, dan tautan halaman pertama; test daftar mempertahankan pagination/URL. ESLint, Prettier, Next.js typegen, TypeScript, dan pemeriksaan whitespace lulus. Suite penuh lokal tertahan pada fixture `lib/router-db-adversarial.test.ts` karena kolom `users.web_user_id` wajib di database lokal. Action invoice/pembayaran, validasi server, endpoint upload, metadata status, autentikasi, serta konstanta rute tidak berubah.
- Test terarah mencakup pengelompokan semua status, nol, nominal pecahan, dataset panjang, query/pembatasan pengguna, status resmi meskipun tanggal lampau, desktop/mobile, PDF/izin tindakan, skeleton/kosong/error, rekening, field, validasi, dan status pengiriman.
- Browser terisolasi pada 320, 390, 768, 1024, 1280, dan 1440px tidak menunjukkan overflow halaman, termasuk nilai besar dan identitas panjang. Dialog transfer pada viewport 320×900px dibatasi tinggi 868px dan dapat digulir tanpa overflow horizontal. Outline fokus terlihat; Escape menutup dialog dan mengembalikan fokus ke tombol pembayaran.
- Pemeriksaan browser memakai komponen React asli dan CSS hasil kompilasi Next.js di dalam shell lokal dengan sesi mock. Fixture hanya berada pada server preview dan memori browser, tanpa mengisi database. Kondisi loading, error, akun tanpa invoice, hasil filter kosong, serta halaman di luar hasil yang tersedia diperiksa. Ringkasan dan pemetaan nominal diperiksa terpisah dengan test.
- Seluruh pengajuan/unggah dijawab mock sebelum mencapai server. Pada desktop dan HP, bukti wajib, double-submit, konfirmasi gagal/berhasil, retensi file/catatan, Midtrans gagal/berhasil, tujuan redirect, pagination, serta filter yang mereset halaman diperiksa. Status tabel tetap mengikuti data asal setelah mock sukses. Handler dan validasi ukuran/format file asli tidak dimodifikasi; batas ukuran dan pesan error juga tercakup pada test panel.
- Konfirmasi bukti sebelumnya mengirim ID, URL bukti, dan catatan yang dipangkas tanpa upload ulang. Permintaan PDF diperiksa melalui respons PDF mock untuk invoice yang dipilih.
- Checkout gateway sungguhan, verifikasi bank, unduh PDF produksi, serta penyelesaian transaksi melalui webhook belum diuji. Tidak ada transaksi/upload sungguhan. Build produksi tidak dijalankan.

```sh
bun test app/dashboard/invoices lib/actions/invoice.test.ts components/dashboard/sidebar.test.ts
bunx prettier --check app/dashboard/invoices components/dashboard/studio-dashboard-routes.ts
bunx eslint app/dashboard/invoices components/dashboard/studio-dashboard-routes.ts
bunx next typegen
bunx tsc --noEmit
git diff --check
```
