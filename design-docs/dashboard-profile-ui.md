# UI Profil Saya

## Cakupan dan data

Rute tepat `/dashboard/profile` memakai shell dashboard yang tersedia. Halaman menampilkan identitas akun terautentikasi serta formulir pembaruan profil asli (`ProfileForm`) secara langsung di halaman tanpa kartu dummy/demo (`Seluruh Proyek Saya`, `Informasi Pembayaran`, maupun `Aktivitas Terbaru` fiktif telah dihapus sepenuhnya).

Backend, API, autentikasi, query profil, validasi, header/sidebar bersama, dan halaman lainnya tetap.

## Susunan dan corak

- Header halaman (`Profil Saya`) dibungkus dalam kartu putih berborder halus yang konsisten dengan halaman dashboard lainnya.
- Kartu identitas memenuhi lebar bagian atas. Foto akun/fallback inisial berada di kiri; nama, peran, email, telepon, dan tanggal bergabung memakai data asli. Email bersifat read-only dan telepon kosong ditampilkan sebagai `Belum ditambahkan`.
- Pose maskot `guide` (`aldera-profile-guide.webp`) berada pada sisi kanan kartu identitas dan tetap terpisah dari avatar akun.
- Di bawah kartu identitas terdapat kartu formulir **Informasi profil** (`ProfileForm`) yang menampilkan input `Nama Lengkap *` dan `Telepon / WhatsApp (Opsional)` berdampingan dalam grid 2 kolom pada layar desktop (`@container (min-width: 54rem)`) dan tersusun vertikal pada layar sempit.
- Kartu putih, teks navy, aksen biru, radius 24px, border navy 18%, teks sekunder navy 72%, serta bayangan halus mengikuti token `--overview-*`.
- Corak titik dan orbit dibatasi di sisi kanan kartu identitas. CSS Modules privat mencegah perubahan pada halaman lain. Maskot bergerak mengambang 3px hanya saat `prefers-reduced-motion` mengizinkan.

## Formulir Profil Asli

`ProfileContent` mempertahankan `prisma.user.findUnique` berdasarkan ID sesi dengan select `id, name, email, roles, avatar, phone, createdAt` dan fallback `safeDb`. Identitas dirender di server; `ProfileForm` client hanya menerima `name` dan `phone`.

| Field                         | Kontrak                                                                  |
| ----------------------------- | ------------------------------------------------------------------------ |
| `name`, ID `name`             | Wajib, nilai awal akun, autocomplete name, placeholder dan label bintang |
| `phone`, ID `phone`           | Opsional, null menjadi string kosong, autocomplete tel, inputMode tel    |
| Email, avatar, peran, tanggal | Hanya ditampilkan; tidak menjadi payload pembaruan                       |

`ProfileForm`, `useProfileForm`, dan `updateProfile(formData)` mempertahankan payload `name`/`phone`, validasi server, trimming, konversi telepon kosong, izin, revalidasi, toast, pending/disabled, guard submit ganda, dan retensi input saat gagal.

Skeleton (`ProfileSkeleton`) menampilkan kerangka kartu identitas dan kartu formulir profil. Jika pengguna tidak ditemukan atau query gagal, halaman menampilkan kondisi tidak tersedia (`ProfileUnavailable`) dengan tombol retry.

## Berkas dan test

Semua path komponen berikut relatif terhadap `app/dashboard/profile/`.

| Berkas                                                            | Tanggung jawab                                           |
| ----------------------------------------------------------------- | -------------------------------------------------------- |
| `page.tsx`, `loading.tsx`, `_components/profile-content.tsx`      | Autentikasi, query asli, Suspense, komposisi halaman     |
| `profile-frame.tsx`, `profile-identity.tsx`, `profile.module.css` | Header kartu, identitas akun, penempatan maskot, styling |
| `profile-form.tsx`, `_hooks/use-profile-form.ts`                  | Formulir pembaruan nama & telepon dan mekanisme simpan   |
| `profile-mascot.tsx`, `profile-mascot.module.css`                 | Aset maskot 3D transparan dan animasi dekoratif          |
| `profile-skeleton.tsx`, `profile-unavailable.tsx`                 | Loading skeleton dan error state profil                  |
| `page.test.tsx`, `_components/*.test.tsx`                         | Pengujian unit dan UI untuk identitas, form, dan maskot  |
