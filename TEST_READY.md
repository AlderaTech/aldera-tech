# Status dan pelaksanaan pengujian

Jalankan `bun run test` untuk seluruh suite atau `bun run test <path-test>` untuk pengujian terarah. Bun minimal 1.4.4 dan Docker wajib tersedia. Runner menyiapkan serta membersihkan database sementara; tidak memakai database akun pengembang atau VPS.

Petunjuk environment, schema router, isolasi mock dan pemeriksaan kualitas ada di [TEST_INFRA.md](TEST_INFRA.md). Kontrak UI dijelaskan pada [panduan UI testing](ai-agent-docs/ui-testing.md).

Hasil eksekusi aktif dan batas verifikasi terdapat pada [laporan perbaikan menyeluruh](ai-agent-docs/project-wide-fixes.md). Test di `tests/e2e` mencakup kontrak serta skenario fitur dengan mock; namanya tidak menyatakan pembayaran, provider AI atau pesan produksi sudah diuji E2E live.
