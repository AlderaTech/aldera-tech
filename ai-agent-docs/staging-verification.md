# Pemeriksaan menyeluruh staging

## Lingkungan dan cakupan

- Lingkungan: `https://staging.aldera.tech`.
- Tanggal pemeriksaan: 16 November 2026 (WIB).
- Source staging: `75be748b7a90b9b5d07f326480ec2e359f59f457`.
- Deployment: [Build and Deploy](https://github.com/AlderaTech/aldera-tech/actions/runs/43769468229), seluruh job deployment dan verifikasi startup lulus.
- Diagnostik runtime baca-saja: [Inspect Staging Startup](https://github.com/AlderaTech/aldera-tech/actions/runs/43770709737).
- Cakupan HTTP: 73 pemeriksaan rute/API dan 88 aset dari halaman publik. Pemeriksaan health, cookie CSRF, serta perbandingan endpoint model dilakukan terpisah.
- Mutasi profil, pendaftaran, OTP/reset password, AI completion, penerbitan key, perubahan izin, publikasi, dan pembayaran memakai fixture/mock pada pengujian terisolasi. Tidak ada pengiriman formulir valid, pesan, atau transaksi sungguhan saat pemeriksaan staging.

## Kondisi yang terverifikasi

| Area                           | Hasil                                                                                                                                                                                    |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime                        | Container `running`, health Docker `healthy`, restart `0`; sinkronisasi Prisma berhasil tanpa flag penerimaan kehilangan data.                                                           |
| Halaman publik dan autentikasi | Beranda, Tentang, Layanan, Portofolio, Harga, Blog, Kontak, AI Relay, FAQ, Testimoni, Login, Register, Forgot Password, dan Reset Password merespons HTTP 200.                           |
| Proteksi halaman               | Seluruh 32 halaman statis Dashboard/Admin yang teridentifikasi mengarahkan permintaan tanpa sesi ke Login dan mempertahankan callback URL.                                               |
| API privat                     | Pencarian, empat ekspor admin, PDF invoice, dan upload menolak permintaan tanpa sesi dengan HTTP 401.                                                                                    |
| Cron                           | Kelima endpoint cron menolak permintaan tanpa secret dengan HTTP 401 sebelum menjalankan pekerjaan.                                                                                      |
| Webhook pembayaran             | Payload audit yang tidak lengkap ditolak HTTP 400 sebelum verifikasi kredensial, lookup invoice, maupun perubahan pembayaran.                                                            |
| Berkas dan rute tidak tersedia | ID/path audit yang tidak ada, halaman yang tidak ada, `/.env`, dan `/.git/config` merespons HTTP 404. Ini tidak menggantikan tes otorisasi terhadap dokumen privat yang memang tersedia. |
| Aset                           | 88 dari 88 URL aset lokal yang dikumpulkan dari HTML berhasil diambil dengan HTTP 200.                                                                                                   |
| Pencarian/filter publik        | Empat variasi pencarian, kategori tidak ditemukan, dan halaman pagination jauh di luar hasil merespons HTTP 200 tanpa error server.                                                      |
| Sesi anonim dan CSRF           | Sesi anonim tidak berisi pengguna; token CSRF diterbitkan. Cookie autentikasi yang diperiksa menggunakan Secure, HttpOnly, dan SameSite=Lax. Nilai token/cookie tidak dicatat.           |
| Dependensi lokal aplikasi      | Health melaporkan database utama, database router, dan storage yang diprobing berstatus `up`.                                                                                            |

## Temuan yang belum diperbaiki

### P1 — Autentikasi upstream AI ditolak

- Bukti live: `/api/health` merespons HTTP 503; `upstreamRouter` dan alias `upstream9router` melaporkan `Upstream returned HTTP 401: Unauthorized`.
- Interpretasi: upstream dapat dijangkau melalui jaringan, tetapi menolak autentikasi request daftar model. Kondisi ini bukan bukti server upstream mati.
- [Health handler](../app/api/health/route.ts), [permintaan completion](../lib/relay-upstream.ts), dan sinkronisasi model memakai `NINE_ROUTER_API_KEY` sebagai bearer ketika tersedia.
- Tindak lanjut: periksa konfigurasi secret dan kebijakan autentikasi upstream staging melalui pengelola environment. Belum ditentukan apakah key kosong, tidak cocok, atau ditolak oleh kebijakan lain. Jangan mencetak key, menyalin key produksi, membuat kredensial baru secara sembarang, atau memalsukan health sukses.
- Completion berbayar tidak dijalankan; keberhasilan chat/integrasi IDE belum dapat disimpulkan dari katalog publik ataupun test mock.

### P1 — URL panduan integrasi AI tidak konsisten dengan endpoint yang merespons

- [Konten AI publik](<../app/(public)/ai-relay/_data/relay-content.ts>) menetapkan `https://aldera.tech/api/relay`. Nilai ini juga ditemukan pada HTML halaman staging.
- GET anonim `https://aldera.tech/api/relay/v1/models` dan path yang sama pada staging menghasilkan HTTP 404 berupa halaman HTML.
- [Dialog konfigurasi Dashboard](../components/ai-relay/preset-config-modal.tsx) memakai default `https://api.aldera.tech`; GET anonim `/v1/models` di host tersebut menghasilkan HTTP 200 dan payload katalog OpenAI dengan enam entri.
- Tindak lanjut: tetapkan endpoint resmi per lingkungan dan selaraskan contoh publik, preset IDE, serta reverse proxy. Katalog anonim HTTP 200 tidak membuktikan key, billing, atau completion berfungsi. Routing berbasis kredensial belum diuji.

### P2 — Teks formula pada ekspor CSV belum dinetralkan

- Lokasi: [helper CSV](../lib/csv.ts), dipakai ekspor proyek, invoice, timesheet, dan analitik.
- Reproduksi lokal murni: `toCsv([{ name: "=1+1" }])` menghasilkan `name\n=1+1` tanpa penanda bahwa nilai tersebut adalah teks.
- Nama pengguna yang dapat diedit ikut diekspor melalui `clientName`; validasi nama tidak melarang nilai contoh tersebut.
- Risiko: aplikasi spreadsheet dapat memperlakukan input sebagai formula. Tidak ada spreadsheet atau formula eksternal yang dieksekusi saat audit.
- Tindak lanjut: tentukan strategi ekspor teks yang aman untuk aplikasi spreadsheet sasaran, pertahankan nilai numerik/mata uang, dan tambahkan regresi untuk formula serta delimiter. [Rujukan OWASP](https://owasp.org/www-community/attacks/CSV_Injection).

### P2 — Rentang tanggal ekspor timesheet belum divalidasi

- Lokasi: [route ekspor timesheet](../app/api/admin/export/timesheet/route.ts).
- Reproduksi dengan sesi admin dan database mock: `from=invalid&to=2026-11-16` meneruskan `Invalid Date` ke `timeEntry.findMany`; exception database tidak ditangani handler.
- Reproduksi rentang terbalik: `from=2026-11-16&to=2026-10-16` tetap memanggil database dan menghasilkan HTTP 200.
- Tindak lanjut: validasi format/tanggal aktual dan `from <= to` sebelum query, kembalikan HTTP 400 yang jelas, lalu uji tanggal valid, tidak valid, dan rentang terbalik. Tidak ada ekspor berisi data akun asli yang diambil.

### P2 — Kegagalan database pencarian disamarkan sebagai hasil kosong

- Lokasi: [route pencarian](../app/api/search/route.ts), blok `catch` mencatat error lalu tetap mengembalikan `{ results }` dengan HTTP 200.
- Reproduksi dengan sesi admin dan query mock yang melempar exception: respons HTTP 200 dengan `{ "results": [] }`.
- Dampak: UI tidak dapat membedakan hasil tidak ditemukan dari kegagalan layanan; sebagian hasil dari query lain juga dapat hilang tanpa status error.
- Tindak lanjut: bedakan kegagalan server dengan hasil kosong yang sah, pertahankan batas izin dan cakupan data, dan tambahkan regresi untuk error database.

### P3 — Staging masih mengizinkan pengindeksan halaman publik

- [Robots](../app/robots.ts) menghasilkan `Allow: /` dan sitemap staging berisi sepuluh URL statis staging.
- Tidak ditemukan `X-Robots-Tag: noindex` maupun meta robots `noindex` pada halaman publik yang diperiksa.
- Tindak lanjut: bila staging bukan sasaran indeks publik, gunakan kebijakan noindex khusus lingkungan dan robots yang sesuai. Robots/noindex tidak menggantikan autentikasi.

## Pengujian kode

- `bun test`: **898 pass, 0 fail**, 210 berkas; PostgreSQL aplikasi dan router terisolasi, schema/seed router resmi yang dipakai CI.
- Pengujian fokus startup/schema/permissions: **27 pass, 0 fail**, empat berkas.
- Test terkait yang ditelusuri antara lain `auth.test.ts`, `lib/auth-session.test.ts`, `lib/backend-security.test.ts`, `lib/permissions.test.ts`, `lib/relay-upstream.test.ts`, `lib/router-db*.test.ts`, `lib/invoice-balance-effects.test.ts`, `lib/manual-payment-verification.test.ts`, `lib/file-download.test.ts`, `lib/upload-content.test.ts`, test kalkulator, dan test webhook pembayaran.
- Regresi yang tersedia lulus; temuan CSV, query timesheet invalid, dan error pencarian di atas belum dicakup kontrak test yang ada. Reproduksi audit memakai fungsi lokal/mock tanpa mengubah implementasi atau menyimpan test yang mengunci perilaku bug.
- `bun run lint`, `bunx next typegen`, dan `bunx tsc --noEmit`: lulus.
- Tidak ada dependency, endpoint, skema, aturan akses, atau implementasi bisnis yang diubah dalam task audit ini.

## Batas pemeriksaan

- Belum ada E2E browser dengan akun pengujian staging Client/Admin; redirect tanpa sesi dan fixture izin bukan pengganti verifikasi tersebut.
- Belum ada verifikasi visual desktop/mobile, fokus keyboard aktual, atau interaksi streaming di browser pada deployment ini.
- Sitemap hanya memuat sepuluh URL statis. Halaman detail yang memerlukan ID/slug data nyata belum diuji live; pengujian route/component yang tersedia memakai fixture.
- Pengiriman WhatsApp/Telegram/email, Turnstile riil, sandbox payment gateway, completion AI berbayar, pengunduhan dokumen akun asli, dan pembaruan profil produksi tidak dijalankan.
- Ketahanan volume privat terhadap penghapusan stack/redeploy penuh belum diuji pada VPS. Probe health hanya membuktikan akses storage yang diperiksa saat request berjalan.
- Tidak ada pernyataan bahwa seluruh sistem sehat: akses website pulih dan proteksi anonim teruji, sedangkan upstream AI serta temuan kode di atas masih memerlukan tindak lanjut.
