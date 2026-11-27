# Runner dan sharding CI

Workflow aktif: [Build and Deploy](../.github/workflows/build-and-deploy.yml).
Seluruh runner memakai Bun 1.4.4. Perubahan pipeline tidak mengubah aplikasi,
database, tarif, atau mekanisme deployment.

## Pembagian runner

| Job                                       | Pemeriksaan                                                                             | Dependensi                                                  |
| ----------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Plan CI Runners & Shards                  | Inventaris file dan durasi job sebelumnya; menghasilkan matrix                          | Tidak membutuhkan dependency aplikasi                       |
| Linter & Static Analysis                  | ESLint, termasuk aturan Next.js dan TypeScript                                          | Matrix lint                                                 |
| Next.js Types & TypeScript                | `next typegen`, lalu pemeriksaan tipe seluruh proyek                                    | Berjalan paralel                                            |
| Configuration & Infrastructure Safeguards | Test Python guard credential staging, config drift, dan pemindaian secret pada template | Berjalan paralel                                            |
| Unit Tests                                | Helper, validasi, kontrak, dan test tanpa database                                      | Matrix unit                                                 |
| UI Tests                                  | Rendering komponen/halaman dan kontrak UI dengan Bun                                    | Matrix UI; bukan browser E2E                                |
| Integration Tests                         | Server actions, API, transaksi, lock, serta schema PostgreSQL                           | Matrix integration; setiap shard mempunyai database sendiri |
| Validate Code & Types                     | Gerbang hasil lint, typecheck, konfigurasi, dan planner                                 | Nama check lama dipertahankan                               |
| Run Unit & Integration Tests              | Gerbang semua suite; mencocokkan manifest dengan inventaris file                        | Nama check lama dipertahankan                               |
| Build and Publish Docker Image            | Build, publikasi, lalu deployment sesuai branch                                         | Kedua gerbang wajib sukses                                  |

Unit dan UI tidak menjalankan service PostgreSQL. Child process pengujian
mendapat environment tersanitasi dari [test-environment.ts](../scripts/test-environment.ts):
kredensial aplikasi tidak diwariskan, provider eksternal diarahkan ke mock/alamat
lokal yang tidak melayani permintaan. Integration menggunakan schema router pada
revision yang dipin di workflow. Test rendering server yang membutuhkan katalog
database termasuk integration, meskipun ekstensi filenya `.test.tsx`.

## Aturan horizontal split

- Planner membaca sepuluh workflow selesai terakhir melalui GitHub Actions API,
  lalu menggunakan run paling baru untuk masing-masing lane lint/unit/UI/integration.
- Durasi adalah `completed_at - started_at` job, termasuk setup dan pengunggahan
  artifact, tetapi tidak termasuk waktu antre runner.
- Job tepat **420 detik** tetap pada jumlah shard yang sama. Job **di atas
  420 detik** menaikkan jumlah shard pada **pipeline berikutnya**. Eksekusi yang
  sudah berjalan tidak dipindahkan ke runner lain.
- Rumus: maksimum antara jumlah shard sebelumnya + 1 dan
  `ceil(shard_sebelumnya × durasi_terlama / 360)`, ketika melewati ambang.
  Target enam menit menyediakan ruang untuk overhead.
- Jumlah shard tidak otomatis diturunkan. Batasnya delapan per lane atau jumlah
  file, agar tidak membuat shard kosong dan menjaga biaya runner.
- File diurutkan secara deterministik, lalu dibagi dengan round-robin. Satu file
  dijalankan oleh satu shard. Test di dalam satu file tidak dipecah.
- Jika delapan shard tetap melewati tujuh menit, planner menampilkan warning.
  Periksa setup, layanan eksternal, atau pecah file test yang lambat; jangan
  menyamarkan bottleneck dengan menaikkan timeout.
- Riwayat tidak tersedia/izin API ditolak: warning ditampilkan dan seluruh test
  tetap berjalan dalam satu shard per suite. Pengujian tidak dilewati.

Typecheck mempertahankan satu graph TypeScript utuh; memeriksa potongan file
secara terpisah dapat menghilangkan error lintas modul. Konfigurasi dan typecheck
sudah dipisahkan dari lint. Build/deploy bukan suite test dan tidak di-shard;
deployment harus tetap satu kali per environment.

## Hasil dan gerbang deployment

Artifact `ci-test-plan` berisi jumlah file, observasi durasi, serta matrix.
Setiap `test-results-<suite>-<shard>` memuat JUnit XML dan manifest file yang
benar-benar dikirim ke Bun beserta exit code. Retensi artifact tujuh hari.

[test-results.ts](../scripts/ci/test-results.ts) menolak shard gagal, file hilang,
file pengganti, atau test ganda. `fail-fast: false` mempertahankan hasil suite
lain ketika satu shard gagal. Tidak ada `continue-on-error`; build dan deploy
menunggu seluruh gerbang berhasil. Nama dua required check sebelumnya tetap ada
agar branch protection tidak kehilangan gerbangnya.

Mode diagnostik/perbaikan staging manual tetap melewati runner build/test sesuai
fungsi semula. Izin `actions: read` hanya ada pada planner, sedangkan
`packages: write` hanya pada job Docker. Tidak ada secret/variabel aplikasi baru.

## Menjalankan lokal

```bash
# Planner offline: satu shard per suite jika token Actions tidak tersedia.
bun --no-env-file scripts/ci/plan-tests.ts

# Unit/UI tanpa database; indeks shard dimulai dari satu.
bun --no-env-file scripts/ci/run-tests.ts unit 1 2
bun --no-env-file scripts/ci/run-tests.ts unit 2 2
bun --no-env-file scripts/ci/run-tests.ts ui 1 1

# Integration memakai PostgreSQL Docker sementara milik runner lokal.
bun run test --ci-suite=integration --ci-shard=1/1

# Jalankan semua test seperti biasa.
bun run test
```

File baru ditemukan otomatis melalui `git ls-files --cached --others
--exclude-standard`. Pemetaan khusus test database berada pada
[test-sharding.ts](../scripts/ci/test-sharding.ts). Tambahkan test database baru
di luar direktori server action/API pada registry tersebut. Setelah mengubah
pemetaan, jalankan unit dan UI tanpa database serta integration dengan database
terisolasi untuk membuktikan pemisahannya.

File `ci-test-plan.json` dan `.ci-reports/` adalah output lokal yang diabaikan
Git. Bersihkan setelah verifikasi; jangan memasukkan data akun asli ke fixture.

Referensi: [matrix dinamis GitHub Actions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations),
[workflow jobs API](https://docs.github.com/en/rest/actions/workflow-jobs),
[reporter JUnit Bun](https://bun.sh/docs/test/reporters).
