# UI Profil Saya

## Cakupan dan tema

Desain berlaku pada rute tepat `/dashboard/profile`. `getStudioDashboardSection` mengaktifkan sidebar, header, serta token workspace yang sama dengan Ringkasan, Proyek Saya, Kalkulator, AI Relay, dan Invoice. Pengaturan, rute detail, serta halaman lain mempertahankan tampilannya.

Halaman memakai Plus Jakarta Sans, navy/biru, permukaan putih, gradasi biru-es/cyan, radius 18–22px, border tipis, dan bayangan lembut. CSS dibatasi melalui module; tidak ada perubahan token global atau dependensi baru.

## Komposisi

- Judul **Profil Saya** dan deskripsi singkat ditempatkan di atas konten tanpa hero tinggi.
- Container selebar minimal 760px memakai dua kolom: identitas di kiri dan formulir di kanan. Pada container lebih sempit, identitas menjadi kartu horizontal ringkas dan formulir berada di bawahnya.
- Kartu identitas memuat foto tersimpan atau fallback inisial, nama, email, seluruh peran dari `ROLE_LABELS`, dan tanggal bergabung. Tidak ada klaim akun aktif/terverifikasi atau indikator kelengkapan baru.
- Email ditampilkan sebagai informasi yang tidak bisa diedit. Tidak ada tombol unggah/ganti/hapus foto karena mekanisme tersebut belum tersedia pada halaman asal.
- Mini maskot dekoratif 72px pada panel bantuan memakai [aset asisten AI Relay yang sudah tersedia](../public/images/dashboard/ai-relay/aldera-relay-assistant.webp). Panel ini hanya tampil pada layout dua kolom. Maskot tidak menjadi avatar pengguna. Tidak ada aset baru.
- Formulir tetap memiliki dua field asli, dikelompokkan sebagai **Informasi pribadi** dan **Informasi kontak**. Tombol simpan terlihat jelas, mendukung fokus keyboard, dan tidak bergantung pada tinggi viewport yang terkunci.
- Skeleton mengikuti bentuk kartu identitas dan formulir. Data tidak ditemukan atau query gagal menampilkan pesan muat ulang; formulir kosong tidak ditampilkan sebagai pengganti kegagalan.

## Kontrak data dan penyimpanan

Autentikasi dan redirect ke `AUTH_ROUTES.login` tetap sama. Query profil tetap `prisma.user.findUnique` berdasarkan ID sesi, memilih hanya `id`, `name`, `email`, `roles`, `avatar`, `phone`, dan `createdAt`, melalui fallback `safeDb` yang sama. Query dipindahkan ke komponen server `ProfileContent` agar dapat dirender dalam Suspense.

| Field                                 | Perilaku                                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `name`, ID `name`                     | Wajib, nilai awal dari akun, autocomplete nama, placeholder kontekstual                                 |
| `phone`, ID `phone`                   | Opsional, `null` menjadi string kosong, placeholder `+62...`, autocomplete telepon dan keyboard telepon |
| Email, foto, peran, tanggal bergabung | Hanya ditampilkan; tidak dikirim sebagai perubahan profil                                               |

Form tetap memanggil `updateProfile(formData)`. Field, payload FormData, validasi nama pada server, trimming, konversi telepon kosong menjadi `null`, pembatasan pengguna, dan revalidasi profil tidak diubah. Hook lokal menangani state input, status visual, toast, guard permintaan ganda, serta fokus pada error nama.

Input dikontrol agar tidak hilang saat action mengembalikan kegagalan atau permintaan ditolak. Input dan tombol dinonaktifkan selama penyimpanan. Pesan sukses **Profil diperbarui** hanya muncul setelah `result.ok`; pesan server untuk nama ditampilkan dekat field, pesan lainnya menjadi alert formulir. Error tak terduga menghasilkan pesan gagal tanpa mencatat data pengguna. Mengedit kembali field menghapus konfirmasi sukses sebelumnya.

Nama/avatar pada header tetap bersumber dari sesi melalui layout dan `UserMenu`; draft lokal tidak mengganti identitas tersebut. Callback JWT, cookie, session, API, database, dan action profil tidak diubah. Halaman ini tidak menyediakan penggantian password, sesi aktif, autentikasi tambahan, verifikasi email, atau penghapusan akun, sehingga kontrol tersebut tidak ditambahkan.

## Aksesibilitas dan responsivitas

- Label selalu terlihat; nama memakai tanda wajib, telepon menyertakan **(Opsional)**. Hint dan error dihubungkan melalui `aria-describedby`, disertai `aria-invalid` pada nama.
- Pending memakai `aria-busy`, status berhasil memakai `role="status"`, dan kegagalan memakai `role="alert"`. Fokus nama dipulihkan setelah respons validasi dan input kembali aktif.
- Nama serta email panjang membungkus. Tombol dan input mempunyai indikator fokus; urutan keyboard tetap nama, telepon, simpan.
- Pada HP, ukuran input 16px dan tombol simpan memenuhi ruang footer. Dokumen tetap dapat digulir pada viewport pendek, termasuk saat keyboard mengurangi area layar. Reduced motion menonaktifkan transisi dan perubahan skala tombol.

## Berkas

Path berikut relatif terhadap `app/dashboard/profile/`, kecuali disebutkan lain.

| Status              | Berkas                                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Diubah              | `page.tsx`, `_components/profile-form.tsx`                                                                                               |
| Baru                | `loading.tsx`, `page.test.tsx`                                                                                                           |
| Baru                | Folder `_components/`: `profile-content.tsx`, `profile-frame.tsx`, `profile-identity.tsx`                                                |
| Baru                | Folder `_components/`: `profile-skeleton.tsx`, `profile-unavailable.tsx`, `profile.module.css`, `profile-ui.test.tsx`                    |
| Baru                | `_hooks/use-profile-form.ts`, `_types/profile.ts`                                                                                        |
| Diubah di luar rute | `components/dashboard/studio-dashboard-routes.ts` (penambahan rute tepat Profil)                                                         |
| Dokumentasi         | `design-docs/dashboard-profile-ui.md`, `design-docs/dashboard-overview-ui.md`, `design-docs/README.md`, `ai-agent-docs/brand-context.md` |

Tidak ada file/aset yang dihapus. State dan handler formulir lama dipindahkan ke hook lokal.

## Pemeriksaan

- ESLint terarah, Prettier, Next.js typegen, TypeScript, dan pemeriksaan whitespace Git lulus. Hash action profil, autentikasi, konstanta rute, UserMenu, dan header dashboard tidak berubah.
- Test terarah memeriksa sesi/redirect, query dan field asli, nilai awal, telepon kosong, avatar/fallback, peran, tanggal, nama/email panjang, metadata, loading, kondisi data tidak tersedia/error, serta batas tema rute.
- Regresi Invoice dan navigasi sidebar dijalankan bersama test Profil: 33 test lulus tanpa kegagalan.
- Browser terisolasi pada 320, 390, 768, 1024, 1280, dan 1440px tidak menunjukkan overflow. Nama/email panjang juga tidak meluapkan halaman. Pada viewport 390×460px, tombol simpan tetap dapat dijangkau dengan scroll.
- Keyboard berpindah dari nama ke telepon dan simpan dengan fokus terlihat. Sidebar mobile dapat dibuka; header menampilkan Profil Saya. Avatar akun uji tanpa foto menampilkan inisial.
- Seluruh POST pengujian ditahan dan dijawab mock sebelum mencapai server. Pemeriksaan mencakup nama kosong tanpa request, error nama dari server, pending/disabled, guard submit ganda, gagal simpan, kegagalan HTTP, retensi input, telepon kosong, dan sukses setelah respons. Payload tetap hanya nama dan telepon melalui protokol FormData Server Action.
- Identitas kartu/header tidak diganti oleh draft lokal. Setelah pengujian, browser dimuat ulang untuk kembali ke nilai asli akun. Tidak ada profil database, password, email verifikasi, atau akun produksi yang diubah.
- Belum diverifikasi: penyimpanan nyata ke database, penyegaran identitas sesi setelah penyimpanan nyata, serta pemuatan foto dari akun yang sudah memiliki avatar. Kontrak sumber avatar diperiksa melalui test; upload/preview lokal tidak berlaku karena fitur belum tersedia. Build produksi tidak dijalankan.

```sh
bun test app/dashboard/profile app/dashboard/invoices lib/actions/invoice.test.ts components/dashboard/sidebar.test.ts
bunx prettier --check app/dashboard/profile components/dashboard/studio-dashboard-routes.ts
bunx eslint app/dashboard/profile components/dashboard/studio-dashboard-routes.ts
bunx next typegen
bunx tsc --noEmit
git diff --check
```
