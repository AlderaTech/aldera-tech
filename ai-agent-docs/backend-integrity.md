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
- Penyimpanan unggahan masih menggunakan volume publik yang sudah tersedia. Dokumen yang membutuhkan kontrol akses baca memerlukan alur penyimpanan privat tersendiri.

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
- `docker/entrypoint.test.ts`: startup dihentikan jika sinkronisasi schema gagal; skrip menggunakan line ending LF yang ditetapkan di `.gitattributes`.

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
