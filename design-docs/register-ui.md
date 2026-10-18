# UI Register Aldera Tech

## Komposisi dan batas perubahan

- Rute Register memakai panel branding kiri dan formulir kanan pada desktop. Palet biru, slate, putih, cyan, tipografi Plus Jakarta Sans, radius, bayangan, tombol, dan fokus mengikuti Login.
- Stylesheet Login diimpor tanpa dimodifikasi. Penyesuaian jarak dan grid field dibatasi dalam `register.module.css`. Layout autentikasi, Login, serta halaman verifikasi tetap memakai implementasinya masing-masing.
- Tablet menampilkan branding ringkas di atas formulir; pada lebar di bawah 640px hanya logo yang ditampilkan. Tinggi formulir mengikuti konten dan dapat digulir saat keyboard layar terbuka.
- Label, bantuan, dan pesan server terhubung ke input melalui `htmlFor` dan `aria-describedby`. Setiap password memakai kontrol visibilitas independen dengan area sentuh 44px; paste dan password manager tetap didukung.

## Komponen

| Berkas                                                    | Tanggung jawab                                                     |
| --------------------------------------------------------- | ------------------------------------------------------------------ |
| `app/(auth)/register/page.tsx`                            | Metadata dan komposisi halaman server                              |
| `app/(auth)/register/_components/register-experience.tsx` | Branding, maskot, judul, dan tautan navigasi                       |
| `app/(auth)/register/_components/register-form.tsx`       | Status formulir dan tombol submit                                  |
| `app/(auth)/register/_components/register-fields.tsx`     | Lima field asli dan kontrol visibilitas password                   |
| `app/(auth)/register/_components/register-field.tsx`      | Label, bantuan, dan pesan error per field                          |
| `app/(auth)/register/_hooks/use-register-form.ts`         | State, pemanggilan action, toast, dan navigasi yang sudah tersedia |
| `app/(auth)/register/_components/register.module.css`     | Penyesuaian UI khusus Register                                     |

## Kontrak formulir

Urutan dan nama field tetap `name`, `email`, `phone`, `password`, dan `confirmPassword`; semuanya wajib. Autocomplete memakai `name`, `email`, `tel`, dan `new-password`.

Aturan password bersumber dari `lib/validations/auth.ts`: 8–100 karakter, dengan konfirmasi yang sama. Validasi nama, email, serta WhatsApp tetap ditangani skema server yang sama. Tidak ada persetujuan, metode login, field, atau syarat password tambahan.

Submit memanggil `registerAction` asli. Status pending menonaktifkan tombol; pesan server tampil di dekat input dan pada ringkasan error. Nama, email, dan WhatsApp memakai state UI terkontrol agar tidak hilang saat form direset oleh React setelah respons gagal; password tetap berupa input native dan tidak disalin ke state atau penyimpanan browser. State kontak untuk OTP tetap memakai key sessionStorage `aldera_otp_flow` dengan `phone` dan `email`, tanpa password. Respons sukses tetap menuju `/verify-otp?phone=...` melalui helper `AUTH_ROUTES.verifyOtpWithPhone`; helper hanya memusatkan URL yang sama. Pembuatan akun, pengiriman OTP WhatsApp, verifikasi, session, dan kontrol keamanan tidak diubah.

## Aset maskot

- Final: [aldera-cat-register.webp](../public/images/auth/aldera-cat-register.webp), 1024 × 1536, 196.986 byte.
- Referensi identitas: [maskot Login](../public/images/auth/aldera-cat-login.webp).
- Pembuatan: tool bawaan `imagegen`, varian pose berdasarkan referensi karakter; alpha transparan dipertahankan. Konversi WebP dengan Sharp kualitas 90, alpha kualitas 100, effort 6.
- Pose: membawa kartu akun biru dengan simbol profil dan gestur jempol. Wajah, kacamata, headphone, hoodie putih bergaris merah-biru, celana pendek, sepatu, dan material mempertahankan identitas Aldera Tech.
- Penyajian: static import dan `next/image` kualitas 90, ukuran responsif, pemuatan lazy. Dekoratif, `alt=""`, `aria-hidden`, tanpa menangkap pointer. Animasi ringan mengikuti `prefers-reduced-motion` dari stylesheet Login.

## Pemeriksaan UI

- Browser desktop/tablet/HP pada lebar 1440, 1024, 768, 390, dan 320px: field tetap berada dalam viewport, tanpa scroll horizontal. Tombol submit dapat dijangkau melalui scroll pada viewport setinggi 430px.
- Urutan Tab mengikuti nama, email, WhatsApp, password, tombol visibilitas, konfirmasi, tombol visibilitas konfirmasi, submit, lalu Masuk. Kedua kontrol visibilitas bekerja mandiri melalui Enter.
- Validasi native memeriksa field wajib dan format email. Payload yang pasti tidak valid ditolak oleh skema server sebelum query database; pesan asli terhubung ke field. Nama, email, dan WhatsApp tetap terisi; kedua password kembali kosong.
- Tombol pending menampilkan `Memproses...`, disabled, dan `aria-busy="true"`. Reduced motion mematikan animasi dan transisi. Tautan Masuk membuka Login dengan maskot dan kontrol password yang tetap tersedia.
- Tidak ada akun yang dibuat atau OTP yang dikirim dalam pemeriksaan. Alur sukses end-to-end memerlukan lingkungan pengujian yang sesuai; implementasi action dan verifikasi tidak berubah.

### Prompt final

```text
Use case: brand-character. Asset type: transparent 3D mascot cutout for Aldera Tech registration page. Input image 1 is the strict character identity and rendering-style reference. Generate a NEW POSE of this EXACT SAME white cat, not a new character: identical fluffy white fur, pink ears and nose, black sunglasses, oversized black headphones with electric blue rings, sporty white hoodie with red and blue sleeve stripes, white shorts and white sneakers with red/navy/blue accents. Keep the same face, proportions, materials, and premium soft-lit 3D rendering. Primary request: welcoming a new member. One paw holds a small rounded electric-blue ACCOUNT CARD at chest height, with only a clean white avatar silhouette and tiny plus symbol; the other paw gives a friendly thumbs-up. Confident relaxed full-body standing pose, slightly tilted head, friendly closed smile. Composition: portrait 2:3, entire cat including both ears, tail, paws and shoes visible with small breathing room. Soft studio lighting, crisp high-quality fur and cloth, subtle cool blue rim light. Actual transparent alpha background, isolated clean cutout, no backdrop, no floor, no fake checkerboard. No text, no brand names, no watermark, no additional characters, no floating panels, no extra objects, no keyhole. Do not redesign the clothing, headphones, glasses or character identity.
```
