# UI Invoice & Pembayaran

## Cakupan dan identitas

Desain berlaku hanya pada daftar `/dashboard/invoices` dan dialog pembayarannya. `getStudioDashboardSection` mengaktifkan sidebar, header, dan token studio untuk rute tepat ini. Rute detail terpisah, checkout eksternal, dan halaman lain mempertahankan tampilannya.

Plus Jakarta Sans, navy/biru, kartu pastel biru-peach-hijau, border tipis, dan radius mengikuti Ringkasan. CSS dibatasi melalui module. Portal dialog mendapat `overview-chrome.scope` secara eksplisit agar warna tetap konsisten di luar wrapper halaman.

## Data dan nominal

`InvoicesContent` mempertahankan autentikasi dan query asli: invoice milik `session.user.id`, selain `DRAFT`, urut `issueDate` menurun, termasuk judul proyek. Seluruh hasil dimuat tanpa pagination. Konversi `Number(invoice.total)`, `formatCurrency`, tanggal, ID, URL bukti, dan urutan tidak berubah.

Ringkasan memakai seluruh hasil query, bukan sebagian kartu yang terlihat:

| Kartu               | Status yang dicakup    | Angka                                  |
| ------------------- | ---------------------- | -------------------------------------- |
| Menunggu pembayaran | `SENT`, `OVERDUE`      | Jumlah invoice dan penjumlahan `total` |
| Dalam verifikasi    | `PENDING_VERIFICATION` | Jumlah invoice dan penjumlahan `total` |
| Telah dibayar       | `PAID`                 | Jumlah invoice dan penjumlahan `total` |

`CANCELLED` tetap muncul dalam daftar, tetapi tidak masuk ringkasan tersebut. Label status mengikuti `invoiceStatusMeta`; tanggal browser tidak mengubah `SENT` menjadi `OVERDUE`. Tidak ada tren, grafik, atau statistik buatan. Query gagal memakai fallback `null` untuk menampilkan error dan muat ulang, tanpa ringkasan nol palsu.

## Daftar dan kondisi halaman

- Container daftar selebar minimal 960px menggunakan tabel semantik. Nominal rata kanan; nomor invoice, proyek, tanggal terbit, jatuh tempo, status, dan tindakan tersedia.
- Container lebih sempit menggunakan kartu; mulai 620px tersedia dua kolom. Nama panjang dapat membungkus. Pencarian, filter, pengurutan, dan pagination belum tersedia pada implementasi asal sehingga tidak ditambahkan.
- Skeleton mengikuti tiga ringkasan dan daftar. Empty state menjelaskan bahwa invoice belum tersedia, tanpa menyatakan semua tagihan lunas, serta menautkan Proyek Saya.
- Mini maskot menggunakan [aset asisten AI Relay yang tersedia](../public/images/dashboard/ai-relay/aldera-relay-assistant.webp). Ukuran 85–100px, dekoratif, lazy-loaded. Tidak ada aset baru.

## Pembayaran dan aksesibilitas

- Tindakan pembayaran tetap hanya untuk `SENT`, `OVERDUE`, dan `PENDING_VERIFICATION`; label terakhir tetap **Lihat Bukti**. PDF memakai `API_ROUTES.invoicePdf(id)` dengan atribut `download`.
- Tab awal tetap `manual` jika bukti tersedia; selain itu `midtrans`. Tab mempertahankan state lokal dialog dan tidak mengubah URL, sesuai perilaku asal.
- Midtrans tetap memanggil `createInvoicePaymentSnapAction(invoice.id)`, membuka `redirectUrl` pada tab baru, dan memakai fallback navigasi ketika popup diblokir. Frontend tidak menandai invoice lunas.
- Dua rekening asli beserta nomor, format tampilan, dan pemiliknya dipindahkan tanpa perubahan. Clipboard memberikan feedback berhasil/gagal.
- `proof-file` tetap menerima JPG/PNG/WebP/PDF, maksimal 10MB. `proof-notes` tetap opsional. Bukti lama dapat digunakan tanpa upload baru. PDF lama menjadi tautan dokumen, gambar menjadi preview.
- Upload tetap `POST API_ROUTES.upload` dengan `FormData` bernama `file`. Konfirmasi tetap `submitPaymentProofAction({ invoiceId, proofUrl, notes: notes.trim() })`.
- Hook lokal menangani preview, status pengiriman, guard permintaan ganda, pesan error dekat field/panel, dan pembersihan blob URL. File dan catatan tetap tersedia ketika gagal. Validasi server serta status backend tidak diubah.
- Dialog dapat digulir pada viewport pendek, mendukung fokus keyboard yang terlihat, Escape, dan pengembalian fokus ke pemicu. Reduced motion meniadakan transisi baris/spinner.

## Berkas implementasi

Path berikut relatif terhadap `app/dashboard/invoices/`, kecuali disebutkan lain.

| Status              | Berkas                                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Diubah              | `page.tsx`, `_components/client-invoices-table.tsx`, `_components/upload-proof-dialog.tsx`                                                |
| Baru                | `loading.tsx`, `_types/invoice.ts`, `_utils/invoice-summary.ts`                                                                           |
| Baru                | `_hooks/use-invoice-selection.ts`, `_hooks/use-invoice-payment.ts`                                                                        |
| Baru                | `_data/bank-accounts.ts`                                                                                                                  |
| Baru                | `_components/invoices-frame.tsx`, `invoices-content.tsx`, `invoices-summary.tsx`, `invoices-skeleton.tsx`                                 |
| Baru                | `_components/invoices-empty-state.tsx`, `invoices-load-error.tsx`                                                                         |
| Baru                | `_components/invoice-desktop-table.tsx`, `invoice-mobile-cards.tsx`, `invoice-status.tsx`, `invoice-actions.tsx`                          |
| Baru                | `_components/online-payment-panel.tsx`, `manual-payment-form.tsx`, `payment-bank-accounts.tsx`, `payment-proof-field.tsx`                 |
| Baru                | `_components/invoices.module.css`, `payment-dialog.module.css`                                                                            |
| Baru                | `page.test.tsx`, `_utils/invoice-summary.test.ts`, `_components/invoices-view.test.tsx`, `_components/payment-panels.test.tsx`            |
| Diubah di luar rute | `components/dashboard/studio-dashboard-routes.ts` (rute tepat invoice)                                                                    |
| Dokumentasi         | `design-docs/dashboard-invoices-ui.md`, `design-docs/dashboard-overview-ui.md`, `design-docs/README.md`, `ai-agent-docs/brand-context.md` |

Tidak ada file/aset dihapus. Dialog lama dipecah menjadi komponen presentasi dan hook; tidak ada implementasi lama yang ditinggalkan.

## Pemeriksaan

- Verifikasi terarah: 25 test lulus, 0 gagal. ESLint, Prettier, Next.js typegen, TypeScript, dan pemeriksaan whitespace Git lulus. Action invoice/pembayaran, validasi server, endpoint upload, metadata status, autentikasi, serta konstanta rute tidak berubah.
- Test terarah mencakup pengelompokan semua status, nol, nominal pecahan, dataset panjang, query/pembatasan pengguna, status resmi meskipun tanggal lampau, desktop/mobile, PDF/izin tindakan, skeleton/kosong/error, rekening, field, validasi, dan status pengiriman.
- Browser terisolasi pada 320, 390, 768, 1024, 1280, dan 1440px tidak menunjukkan overflow halaman. Dialog transfer pada 320–1440px tetap berada dalam viewport tanpa overflow horizontal internal. Sidebar mobile terbuka dengan Invoice aktif; CTA empty state membuka Proyek Saya. Fokus kembali ke tombol pembayaran setelah dialog ditutup.
- Akun uji belum memiliki invoice. Daftar berisi invoice diperiksa memakai fixture dalam memori browser, tanpa mengisi database. Ringkasan dan pemetaan nominal diperiksa terpisah dengan test.
- Seluruh POST pembayaran/unggah ditahan dan dijawab mock sebelum mencapai server: double-submit, Midtrans gagal/berhasil, tujuan redirect, bukti wajib, batas 10MB, salin rekening, kegagalan upload/konfirmasi, retensi file/catatan, dan keberhasilan konfirmasi diperiksa. Status tabel tetap mengikuti data asal setelah mock sukses.
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
