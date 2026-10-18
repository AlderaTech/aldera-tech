# UI Lupa Password Aldera Tech

## Komposisi

Halaman `/forgot-password` memakai panel branding bergradasi biru-es/slate di kiri dan formulir email di kanan pada desktop. Logo, Plus Jakarta Sans, warna, radius, bayangan, input, tombol pill, serta indikator fokus berasal dari stylesheet Login yang diimpor tanpa dimodifikasi. Frame desktop memiliki tinggi minimum 40rem dan tetap bertambah mengikuti konten.

Pada tablet panel branding tampil di atas formulir. Di bawah 640px, branding hanya menampilkan logo; ilustrasi dan copy pendukung disembunyikan. Tinggi halaman mengikuti konten, sehingga tombol tetap dapat dijangkau saat viewport pendek atau keyboard layar terbuka. Animasi mengikuti pengaturan reduced motion.

## Kontrak pemulihan

- Field asli tetap `id="email"`, `name="email"`, `type="email"`, wajib, dan autocomplete email. Label selalu terlihat; bantuan serta error terhubung melalui `aria-describedby`.
- Form tetap memakai `useActionState` dan `requestPasswordResetAction`. Pemeriksaan format email frontend yang sudah tersedia dipusatkan dalam skema UI di `lib/validations/forgot-password-form.ts`, dengan trim, pola regex, dan pesan penolakan yang sama. Skema server di `lib/validations/password-reset.ts` tidak berubah dan tetap menentukan validitas permintaan di server.
- Email memakai state UI agar tidak hilang saat respons gagal. Tombol pending menampilkan `Mengirim...`, disabled, dan `aria-busy`. Tidak ada timer, pemeriksaan keberadaan akun, metode pemulihan, atau syarat baru.
- Konfirmasi sukses hanya ditampilkan ketika respons `ok` bernilai true; pesan sistem dipertahankan. Error umum tampil di panel status, sedangkan error email ditampilkan dekat input. Panel sukses memakai `role="status"`, error memakai `role="alert"`, dan proses pending memiliki pengumuman pembaca layar.
- Implementasi aktif menerima email sebagai identitas akun, lalu mengirim tautan reset melalui WhatsApp terdaftar. UI menjelaskan kanal aktual tersebut. Tidak ada perubahan pengiriman, database, token, CSRF, kontrol permintaan, routing, atau alur Reset Password.
- Link kembali dan Masuk memakai `AUTH_ROUTES.login`; logo memakai `PUBLIC_ROUTES.home`.

## Berkas

| Berkas                                                                  | Fungsi                                                                          |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `app/(auth)/forgot-password/page.tsx`                                   | Metadata dan komposisi halaman                                                  |
| `app/(auth)/forgot-password/_components/forgot-password-experience.tsx` | Branding, ilustrasi, judul, dan navigasi                                        |
| `app/(auth)/forgot-password/_components/forgot-password-form.tsx`       | Input email dan submit                                                          |
| `app/(auth)/forgot-password/_components/request-status.tsx`             | Tampilan status sistem                                                          |
| `app/(auth)/forgot-password/_components/forgot-password.module.css`     | Penyesuaian lokal                                                               |
| `app/(auth)/forgot-password/_hooks/use-forgot-password-form.ts`         | State UI, action, dan toast                                                     |
| `lib/validations/forgot-password-form.ts`                               | Pemeriksaan format frontend yang sama                                           |
| `app/(auth)/_constants/auth-panel-copy.ts`                              | Varian shared shell yang masih digunakan oleh Reset Password dan Verifikasi OTP |

## Aset

- Final: [aldera-cat-recovery.webp](../public/images/auth/aldera-cat-recovery.webp), 1024 × 1536, 204.534 byte, alpha transparan.
- Referensi identitas: [maskot Login](../public/images/auth/aldera-cat-login.webp). Pose membawa kunci biru dan menunjuk ke kunci mempertahankan karakter, pakaian, headphone, kacamata, proporsi, serta material Aldera Tech.
- Dibuat melalui tool bawaan `imagegen`; konversi Sharp WebP kualitas 90, alpha kualitas 100, effort 6. Aset asli Login/Register tetap dipertahankan.
- Static import, `next/image`, kualitas 90, `sizes` responsif, serta lazy loading. Gambar dekoratif memakai `alt=""`, `aria-hidden`, dan tidak menangkap pointer.

## Verifikasi UI

- Browser pada lebar 1440, 1024, 768, 390, dan 320px: input serta panel status berada dalam viewport tanpa scroll horizontal. Tombol tetap dapat dijangkau melalui scroll pada viewport setinggi 430px.
- Urutan keyboard setelah logo: kembali ke Login, email, submit, lalu Masuk. Fokus terlihat; input HP memakai ukuran font 16px. Reduced motion mematikan floating dan transisi tombol.
- Field wajib dan format email diperiksa melalui validasi native. Format yang ditolak pemeriksaan frontend menampilkan pesan asli serta `aria-invalid` dan `aria-describedby`, tanpa permintaan jaringan.
- Respons sukses, error email, dan kegagalan pengiriman diperiksa dengan mock transport browser. Setiap POST dicegat sebelum mencapai server; respons mock hanya hidup pada sesi pemeriksaan, tanpa implementasi dummy dalam aplikasi. Status menampilkan pesan respons yang sesuai; tombol pending disabled dan mencegah pengiriman berulang. Email tetap terisi setelah respons.
- Kedua tautan Login dan tautan Lupa Password dari Login berfungsi. Halaman pengisian password baru tidak diubah.
- Tidak ada pesan email/WhatsApp yang dikirim atau token yang dibuat selama pemeriksaan. Pengiriman nyata end-to-end tidak dijalankan.

### Prompt final

```text
Use case: brand-character. Asset type: transparent 3D mascot cutout for Aldera Tech Forgot Password page. Input image 1 is the strict character identity and rendering-style reference. Generate a NEW HELPING POSE of this EXACT SAME white cat, preserving face shape, fluffy white fur, pink ears and nose, black sunglasses, oversized black headphones with electric blue rings, sporty white hoodie with red and blue sleeve stripes, matching white shorts and white sneakers with red/navy/blue accents. Same proportions, premium 3D materials, friendly closed smile and soft studio rendering. Primary request: a calm helpful guide for recovering account access. The cat stands facing slightly toward the viewer's right, holding a small polished electric-blue KEY-shaped object with one paw at chest height; the other paw gently points toward that key, as if explaining how to restore access. No card, no envelope, no screen. Entire body, ears, tail, paws and sneakers visible, natural balanced pose, portrait 2:3 frame with modest breathing room. Clean high-resolution fur, cloth and headphone detail, soft studio key light and restrained cool rim lighting. Output an isolated clean cutout with actual transparent alpha, no backdrop, no floor plane, no fake checkerboard, no environment. Exactly one cat; no text, letters, numbers, logo, watermark, extra characters, floating UI or confetti. Do not redesign the character, glasses, headphones, clothing or proportions.
```
