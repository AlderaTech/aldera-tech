# Integritas autentikasi, pembayaran, dan unggahan

## Sesi dan akun

- `auth.ts` memeriksa akun melalui `refreshSessionToken` pada pembacaan sesi server. Akun hilang, nonaktif, tanpa peran, atau database yang gagal diverifikasi menghasilkan sesi tidak valid. Peran JWT diselaraskan dengan data akun terbaru.
- Middleware menggunakan pemeriksaan JWT awal; setiap halaman, Route Handler, dan Server Action tetap wajib memanggil autentikasi/otorisasi server.
- `User.invitedAt` menandai akun yang dibuat administrator melalui `inviteUserAction`. Akun undangan aktif dapat memakai password sementara tanpa mengklaim nomor telepon telah diverifikasi. Registrasi mandiri tetap memerlukan verifikasi telepon.
- Kolom undangan nullable; tidak ada backfill berdasarkan dugaan untuk akun lama. Pemulihan akun undangan lama memerlukan pemeriksaan identitas oleh administrator.
- Mutasi jenis proyek, fitur, add-on, dan konfigurasi harga memerlukan `settings.manage`. Perubahan status permohonan pesanan memerlukan administrator.

## Pembayaran manual

- Verifikasi hanya menerima invoice `PENDING_VERIFICATION` dengan bukti transfer. Transisi atomik bersyarat ke `PAID` mencegah dua persetujuan membuat pembayaran sukses ganda.
- Permintaan ulang untuk invoice yang sudah `PAID` mengembalikan hasil idempoten tanpa pembayaran, aktivitas, atau notifikasi baru.
- Penolakan hanya berlaku pada bukti yang masih menunggu verifikasi. Unggahan ulang tidak membuka kembali invoice lunas atau dibatalkan dan memperbarui catatan pembayaran pending yang tersedia.
- Tarif, total invoice, mata uang, webhook gateway, dan saldo AI Relay tetap menggunakan sumber serta perhitungan sistem.

## Kontrak unggahan

Endpoint tetap `API_ROUTES.upload`; kirim `file` bersama tepat satu konteks:

| Konteks     | Pemeriksaan server                                                                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `projectId` | Proyek tersedia dan dimiliki klien, atau pengguna staf.                                                                                                                                    |
| `invoiceId` | Invoice milik pengguna atau diakses administrator, berstatus `SENT`, `OVERDUE`, atau `PENDING_VERIFICATION`. Developer tidak mendapat akses lintas akun. Tidak memerlukan proyek tambahan. |
| `topupId`   | Tiket top-up pending terhubung ke `users.web_user_id` akun aktif melalui database router.                                                                                                  |

- Unggahan tanpa konteks hanya tersedia bagi staf untuk alur konten yang sudah ada.
- Bukti pembayaran menerima PNG, JPEG, WebP, atau PDF; batas berkas tetap 10 MB.
- Metadata berkas wajib berhasil disimpan. Kegagalan database menghasilkan HTTP 500, tanpa URL sukses, dan menghapus berkas yang baru ditulis. Kegagalan otorisasi karena layanan database tidak tersedia menghasilkan HTTP 503.
- Media konten staf menggunakan scope `PUBLIC_MEDIA`. Berkas proyek dan bukti pembayaran disimpan di `storage/private-uploads`, di luar `public/`, dengan URL `API_ROUTES.fileDownload(id)` yang memeriksa sesi dan kepemilikan. URL lama `/uploads/` melewati rewrite sebelum static-file serving; media lama hanya publik bila dirujuk konten publik. Bukti transfer memakai `private, no-store` dan `nosniff`.
- Semua gambar didekode dan dikodekan ulang, termasuk berkas kecil; ekstensi ditentukan server. PDF/Office/ZIP memerlukan signature berkas yang sesuai. HTML bertipe MIME gambar ditolak.

## OTP dan integrasi produksi

- OTP menggunakan `crypto.randomInt`. Registrasi dan kirim ulang hanya menyatakan terkirim jika provider mengonfirmasi keberhasilan; respons HTTP 200 dengan `status: false` tetap gagal.
- Pengiriman gagal/simulasi menghapus token yang baru diterbitkan, tanpa mengunci percobaan kirim ulang selama cooldown sukses. Akun registrasi tetap tersedia; antarmuka mengarahkan ke verifikasi dengan pemberitahuan gagal kirim, sehingga pengguna tidak perlu membuat akun ulang.
- Produksi tanpa konfigurasi WhatsApp mengembalikan kegagalan; konten pesan, OTP, dan tautan reset tidak dicetak pada mode simulasi.
- Produksi tanpa secret Turnstile menolak verifikasi. Bypass tanpa secret hanya berlaku pada development/test.

## Pemetaan tes

- `auth.test.ts`, `lib/auth-session.test.ts`: callback autentikasi, pencabutan peran, akun nonaktif/hilang, gangguan database, akun undangan versus registrasi mandiri.
- `lib/actions/calculator-permissions.test.ts`: seluruh mutasi harga, developer ditolak, administrator diizinkan.
- `lib/manual-payment-verification.test.ts`: permintaan berulang dan bersamaan, status tidak memenuhi syarat, rollback kegagalan pembayaran.
- `app/api/upload/route.test.ts`, `lib/upload-authorization.test.ts`: kepemilikan invoice/top-up, status tiket, konteks ambigu, kegagalan metadata dan pembersihan berkas.
- `lib/actions/auth-actions.test.ts`, `lib/whatsapp.test.ts`, `lib/turnstile.test.ts`: provider gagal, respons sukses palsu, simulasi, konfigurasi produksi.
- `lib/payment-proof-upload.test.ts` dan tes hook/komponen pendamping: konteks invoice/top-up serta navigasi pemulihan OTP.
- `docker/entrypoint.test.ts`: memverifikasi sinkronisasi skema non-interaktif (`bunx prisma db push --accept-data-loss` saat `AUTO_MIGRATE=true`) dan penghentian startup jika sinkronisasi schema gagal; skrip menggunakan line ending LF yang ditetapkan di `.gitattributes`.

Tes integrasi memerlukan database aplikasi dan router yang terisolasi. Jangan menjalankannya terhadap database produksi atau memakai layanan pengiriman/pembayaran asli.

## Peta berkas

Implementasi dan konfigurasi:

- `.env.example`
- `.gitattributes`
- `ai-agent-docs/backend-integrity.md`
- `ai-agent-docs/deployment.md`
- `ai-agent-docs/roles-and-features.md`
- `app/(auth)/register/_hooks/use-register-form.ts`
- `app/api/upload/route.ts`
- `app/dashboard/invoices/_hooks/use-invoice-payment.ts`
- `auth.ts`
- `bun.lock`
- `components/ai-relay/balance-topup-card.tsx`
- `docker/Dockerfile`
- `docker/entrypoint.sh`
- `lib/actions/admin.ts`
- `lib/actions/auth.ts`
- `lib/actions/calculator.ts`
- `lib/actions/invoice.ts`
- `lib/auth-session.ts`
- `lib/manual-payment-verification.ts`
- `lib/otp-delivery.ts`
- `lib/payment-proof-upload.ts`
- `lib/turnstile.ts`
- `lib/upload-authorization.ts`
- `lib/validations/upload.ts`
- `lib/whatsapp.ts`
- `package.json`
- `prisma/migrations/20261115000000_admin_invitation_marker/migration.sql`
- `prisma/schema.prisma`

Pengujian pendamping:

- `app/(auth)/register/_hooks/use-register-form.test.ts`
- `app/api/upload/route.test.ts`
- `app/dashboard/invoices/_hooks/use-invoice-payment.test.ts`
- `auth.test.ts`
- `components/ai-relay/balance-topup-card.test.tsx`
- `docker/entrypoint.test.ts`
- `lib/actions/admin-actions.test.ts`
- `lib/actions/auth-actions.test.ts`
- `lib/actions/calculator-permissions.test.ts`
- `lib/actions/invoice-actions.test.ts`
- `lib/auth-session.test.ts`
- `lib/manual-payment-verification.test.ts`
- `lib/payment-proof-upload.test.ts`
- `lib/turnstile.test.ts`
- `lib/upload-authorization.test.ts`
- `lib/whatsapp.test.ts`

## Pembayaran gateway dan rekonsiliasi

- `Invoice.purpose` membedakan `PROJECT` dan `AI_RELAY_TOPUP`; kata pada catatan/deskripsi tidak menentukan kredit. Invoice lama tetap `PROJECT` sampai diperiksa admin.
- Webhook memverifikasi signature dan nominal persis; event terminal tidak mundur karena notifikasi terlambat. Refund penuh mengubah Payment menjadi `REFUNDED` dan Invoice menjadi `CANCELLED` dengan `paidAt=null`. Refund parsial memerlukan tinjauan terpisah dan tidak membalikkan kredit penuh.
- `InvoiceBalanceEffect` disimpan atomik bersama perubahan pembayaran di database utama. Worker menerapkan saldo di router setelah commit, memakai ID efek sebagai referensi ledger dan row lock pengguna untuk mencegah duplikasi. Kegagalan router/acknowledgement tetap dapat dicoba ulang.
- Refund tanpa saldo cukup memblokir `users.is_active` di router dan menandai efek `REVIEW`. Saldo tidak dibuat negatif. Panel tinjauan pada Admin AI Relay menyediakan retry dan pembukaan akses setelah seluruh refund direkonsiliasi. Pembacaan saldo serta top-up tetap tersedia; permintaan AI dan penerbitan API key ditolak selama diblokir.
- Penandaan lunas manual dan bulk mencatat Payment sukses serta audit; perubahan status biasa tidak dapat membatalkan pembayaran final.
- Penerbitan invoice berkala mengunci template dan membuat invoice serta memajukan jadwal dalam satu transaksi. Nomor dokumen memakai advisory lock dan urutan numerik.

## Identitas, konten dan integrasi

- Reset password mengonsumsi token secara atomik, menutup tautan reset lain, dan menaikkan `User.securityVersion`; sesi dengan versi lama ditolak.
- OTP terikat ke akun, memakai lock per nomor, cooldown atomik, serta batas lima percobaan yang tetap berlaku pada permintaan serentak. Token terdahulu ditutup saat kode baru diterbitkan.
- Perubahan nomor profil divalidasi dan dinormalisasi, menolak nomor akun lain dan menghapus verifikasi lama. Nomor belum terverifikasi tidak dapat menerima tautan pemulihan password.
- Konversi proposal mengunci proposal dan identitas email; permintaan ulang mengembalikan proyek yang sama. Akun baru ditandai undangan dan kredensial awal hanya ditampilkan sekali kepada admin.
- Mutasi proyek, proposal, blog dan testimoni memeriksa permission tindakan; milestone/balasan harus berada pada proyek yang sama.
- Sanitasi HTML memakai parser allowlist; JSON-LD meng-escape pembatas script. Kegagalan penyimpanan komentar/reaksi tidak dilaporkan sebagai sukses.
- Playground hanya memakai respons dan penggunaan token upstream yang valid, meneruskan bearer key konfigurasi, serta tidak mendebit saat upstream gagal. Katalog kosong/gagal tidak diganti model atau harga buatan.
- Konfigurasi bot dan metode pembayaran memakai `IntegrationSyncState`: mutasi utama dan antrean disimpan satu transaksi, lalu perubahan entitas yang sama direkonsiliasi ke router. Data router lain tidak dihapus. Kegagalan sinkronisasi ditampilkan sebagai tertunda.
- Cron `API_ROUTES.cronReconcileIntegrations` mencoba ulang efek PENDING dan konfigurasi yang belum sinkron setiap lima menit. Efek REVIEW memerlukan tindakan admin. Token cron wajib. Telegram produksi tanpa token mengembalikan kegagalan tanpa simulasi atau log isi pesan.
- Pemetaan file dan regresi lengkap: [Verifikasi keamanan backend](backend-security-verification.md).

## Koneksi router dan isolasi tes

- Guard query transaksi menggunakan proxy yang tidak mengubah koneksi asli. Setelah koneksi dikembalikan ke pool, metode query asli tetap utuh; SQL audit yang melewati koneksi langsung tetap ditolak trigger database, sementara aksi aplikasi tetap dilindungi guard.
- Tes UI yang mengganti modul halaman, filesystem, atau dependensi bersama berjalan dalam proses Bun terisolasi agar mock tidak memengaruhi halaman maupun integrasi lain. Regresi koneksi pool diuji pada `lib/router-db.test.ts`.
