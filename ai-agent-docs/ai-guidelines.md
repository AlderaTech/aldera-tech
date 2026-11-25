# Panduan UX dan bahasa antarmuka

Panduan ini hanya memuat keputusan lintas halaman tentang interaksi, aksesibilitas, dan bahasa. Standar arsitektur ada di [code-quality.md](code-quality.md), cakupan test ada di [ui-testing.md](ui-testing.md), dan identitas visual ada di [brand-context.md](brand-context.md). Untuk perubahan visual, ikuti implementasi halaman yang aktif.

## Interaksi

- Elemen yang dapat diklik harus tampak dan terasa interaktif, memiliki fokus keyboard yang jelas, serta area sentuh yang memadai.
- Gunakan kursor pointer pada kontrol yang dapat diklik saat perangkat memakai pointer; kursor bukan pengganti nama aksi atau indikator fokus.
- Jangan gunakan `window.confirm()` atau `window.alert()`. Untuk aksi destruktif gunakan dialog konfirmasi aplikasi; tampilkan hasil mutasi melalui toast yang sesuai.
- Operasi asynchronous harus memberi umpan balik loading dan mempertahankan konteks halaman. Gunakan skeleton yang mendekati bentuk konten saat data memuat; gunakan error state saat query gagal.
- Hormati `prefers-reduced-motion`; animasi dekoratif tidak boleh menghalangi konten, fokus, atau navigasi.

## Bahasa dan istilah

- Gunakan Bahasa Indonesia yang jelas dan konsisten untuk label, instruksi, empty state, serta pesan error.
- Pertahankan istilah teknis umum seperti API, token, database, dan webhook jika lebih mudah dipahami daripada padanan terjemahan.
- Tulis durasi secara konsisten menggunakan “jam” atau “j”; jangan mencampur format dalam satu tampilan.
- Jangan menampilkan angka performa, kepuasan, atau hasil bisnis tanpa sumber data yang dapat diverifikasi.

## Visual

- Ikuti token warna dan tipografi di [brand-context.md](brand-context.md); hindari nilai visual khusus yang hanya cocok pada satu halaman di stylesheet global.
- Gunakan aset yang sudah disetujui dan tersedia di `public/`. Jangan membuat arsip layout, aset, atau prompt per task kecuali diminta secara khusus.
- Jaga konsistensi layout bersama tanpa memaksa semua halaman menggunakan komposisi yang sama.
