# Indeks dokumentasi engineering

Dokumen ini adalah indeks, bukan aturan tambahan. Baca hanya panduan kanonis yang relevan dengan tugas; jangan membaca seluruh direktori secara otomatis.

## Panduan kanonis

| Topik                                                      | Sumber utama                                               |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| Alur kerja, branch, sinkronisasi dokumen, dan laporan task | [agent-workflow.md](agent-workflow.md)                     |
| Struktur, validasi, state, error, dan standar kode         | [code-quality.md](code-quality.md)                         |
| Interaksi, aksesibilitas, dan bahasa antarmuka             | [ai-guidelines.md](ai-guidelines.md)                       |
| Perilaku dan cakupan test antarmuka                        | [ui-testing.md](ui-testing.md)                             |
| Model role, otorisasi, dan batas akses server              | [roles-and-features.md](roles-and-features.md)             |
| Konstanta dan pola penggunaan rute                         | [routes-and-navigation.md](routes-and-navigation.md)       |
| Invarian autentikasi, transaksi, integrasi, dan unggahan   | [backend-integrity.md](backend-integrity.md)               |
| Runner lokal dan isolasi database test                     | [testing-infrastructure.md](testing-infrastructure.md)     |
| Runner serta sharding CI                                   | [ci-testing.md](ci-testing.md)                             |
| Runtime, Docker, environment, dan multi-stack deployment   | [deployment.md](deployment.md)                             |
| Identitas, token desain, dan istilah brand                 | [brand-context.md](brand-context.md)                       |
| Gerbang umum sebelum rilis produksi                        | [public-release-readiness.md](public-release-readiness.md) |

Implementasi tetap menjadi sumber kebenaran untuk route, permission, schema, konfigurasi, dan perilaku runtime. Dokumen ini menjelaskan batas dan pola yang tidak jelas hanya dari nama berkas.

## Urutan baca

1. Baca [AGENTS.md](../AGENTS.md).
2. Baca [agent-workflow.md](agent-workflow.md).
3. Pilih sumber utama di atas sesuai area yang diubah.
4. Untuk perubahan visual, ikuti implementasi halaman yang aktif dan aturan lintas halaman di [brand-context.md](brand-context.md) serta [ai-guidelines.md](ai-guidelines.md).

## Pemeliharaan dokumentasi

Pertahankan satu sumber utama per topik. Jangan menambahkan catatan hasil task, daftar berkas yang diubah, atau salinan feature/test inventory ke panduan aktif. Simpan bukti task pada PR atau CI; perbarui dokumen ini hanya ketika sumber kanonis berubah.
