# Navigasi dan filter Admin

## Cakupan

Penyesuaian presentasi terbatas pada pilihan peran Pengguna & Tim, filter tanggal Timesheet, dan tab Pengaturan Situs. Data, izin, query server, URL tujuan, field formulir, validasi dan tindakan penyimpanan tetap memakai implementasi asli. Tidak ada aset, endpoint, dependency atau konfigurasi deployment baru.

## Pengguna & Tim

UserRoleTabs memakai panel putih dengan border dan bayangan halus. Pilihan aktif berwarna biru dengan teks putih; badge jumlah memakai teks biru pada putih. Pilihan lainnya memakai teks navy agar terbaca. Empat pilihan tersusun sejajar di desktop dan dua kolom pada HP. Tampilan staf tanpa izin pengelolaan pengguna tetap hanya menyediakan Developer & Tim.

Tautan peran serta pilihan Beban Kerja/Daftar Akun mempertahankan parameter role dan view. Penanda aria-current mengikuti activeRole/activeView dari server. Jumlah ditampilkan langsung dari props; peran yang tumpang tindih tidak dijumlahkan ulang. Area klik minimal 44px, fokus keyboard terlihat dan label panjang dapat membungkus.

## Timesheet

TimesheetFilters ditempatkan di bawah banner, sebelum statistik. Panel putih mengelompokkan Dari, Sampai, Filter dan Unduh CSV. Input dan tombol setinggi 44px, sejajar pada desktop; tombol berada di baris berikutnya dengan lebar sama pada layar kecil.

Form tetap memakai GET pada route saat ini dengan nama/id from dan to. Nilai awal berasal dari konversi tanggal yang sama pada halaman server. Field tetap opsional. Ekspor memakai API_ROUTES.exportTimesheetWithRange dengan rentang yang sedang diterapkan, bukan mengubah query, agregasi waktu atau rumus statistik.

## Pengaturan Situs

SettingsForm memakai WorkspaceTabsList/WorkspaceTabsTrigger dengan dua kolom sama lebar: Profil Website dan Sosial & Kontak. Indikator biru mengikuti state Radix. Label dapat membungkus pada HP, ikon dekoratif tidak dibacakan, dan navigasi keyboard tetap tersedia.

Nilai profile/contact, sinkronisasi query tab, fallback tab tidak dikenal, useActionState, isi field dan updateSiteSettingsAction tidak berubah. Komponen bersama tidak mendapat modifikasi styling untuk penyesuaian ini.

## Berkas

- Dimodifikasi: app/admin/users/_components/user-role-tabs.tsx.
- Dibuat: app/admin/users/_components/user-role-tabs.module.css dan user-role-tabs.test.tsx.
- Dimodifikasi: app/admin/timesheet/page.tsx dan page.test.tsx.
- Dibuat: app/admin/timesheet/_components/timesheet-filters.tsx, timesheet-filters.module.css dan timesheet-filters.test.tsx.
- Dimodifikasi: app/admin/settings/_components/settings-form.tsx dan settings-form.test.tsx.
- Dokumentasi terkait: dokumen ini, admin-studio-ui.md, admin-header-empty-state-ui.md, workspace-visual-consistency.md dan dashboard-density-and-mascots.md.
- Tidak ada berkas yang dihapus. Markup form tanggal lama dan import yang tidak dipakai dibersihkan dari halaman Timesheet.

## Pemeriksaan

- Pemetaan test: seluruh test pada app/admin/users, app/admin/timesheet dan app/admin/settings diperiksa. Dua test UI co-located baru menguji pilihan peran serta filter tanggal; test halaman Timesheet dan SettingsForm diperbarui.
- Pengujian terarah ketiga halaman: 18 pass, 0 fail, 9 berkas. Suite lengkap bun test pada salinan Linux dengan lockfile dan database sementara bersih: 798 pass, 0 fail, 173 berkas.
- Browser fixture memakai komponen asli beserta tema Admin pada lebar 320, 390, 824 dan 1440px. Semua pilihan peran serta tampilan tim dapat dibuka, tab pengaturan memperbarui query tab, tanggal terkirim melalui GET, dan URL ekspor tetap membawa rentang yang diterapkan. Tidak ada overflow halaman atau gambar rusak.
- Desktop: kedua tab Pengaturan sama lebar; kedua input tanggal dan kedua tombol Timesheet sejajar. HP: label membungkus, pilihan peran dua kolom, aksi tanggal dua kolom di bawah input.
- Prettier, Next.js typegen dan typecheck lulus. Linter 0 error dengan empat warning existing pada test backend yang tidak diedit.
- Browser memakai fixture serta action mock. Penyimpanan pengaturan, undangan pengguna dan unduh CSV melalui server berautentikasi tidak dijalankan; tidak ada perubahan data produksi.
