# Aldera Tech — AI Agent Knowledge Base & Engineering Protocols

Dokumen ini merupakan indeks dan gerbang utama (_Index & Gateway_) direktori `ai-agent-docs/`. Direktori ini dirancang dan di-branding secara khusus sebagai **basis pengetahuan resmi bagi AI Agent dan asisten koding otonom** yang berkontribusi pada pengembangan repositori **Aldera Tech**.

---

## 1. Tujuan & Filosofi Direktori `ai-agent-docs/`

> [!IMPORTANT]
> **Direktori ini BUKAN dokumentasi manual untuk pengguna akhir (human user guide), melainkan kumpulan protokol rekayasa, aturan sistem (_system instructions_), spesifikasi arsitektur teknis, dan standar kualitas kode yang wajib dipatuhi oleh seluruh AI Agent.**

Setiap AI Agent yang menerima instruksi atau ditugaskan untuk memperbaiki bug, menambah fitur, atau merekayasa ulang komponen di repositori ini **WAJIB** membaca dan merujuk dokumen terkait di direktori ini sebelum dan sesudah melakukan perubahan kode.

---

## 2. Peta Dokumen Utama AI Agent (Core AI Agent Documentation)

Dokumen di bawah ini merupakan dokumen inti yang aktif, deterministik, dan wajib dipatuhi:

### A. Protokol Operasional & Standar Rekayasa (Operational SOP & Quality)

| Dokumen                                      | Deskripsi & Fokus AI Agent                                                                                                                                                                                                                                         | Tingkat Wajib |
| :------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------: |
| [**`agent-workflow.md`**](agent-workflow.md) | **Standard Operating Procedure (SOP) Alur Kerja AI Agent**: Aturan Git Branching Model (`main <- staging <- feat/*`), cabang dari `origin/staging`, PR ke `staging`, pemetaan test, protokol dead code cleanup, batasan perintah, dan checklist penyelesaian task. | 🔴 **MUTLAK** |
| [**`code-quality.md`**](code-quality.md)     | **18 Prinsip Kualitas Kode & Arsitektur Modular**: Kebijakan anti-fat files (~200–250 baris), zero-any, sentralisasi Zod, pemisahan UI & custom hooks, RSC/RCC boundaries, shareable URL state, dan penanganan 4 UI states.                                        | 🔴 **MUTLAK** |
| [**`ui-testing.md`**](ui-testing.md)         | **Standarisasi Pengujian Antarmuka Pengguna (UI Testing)**: Kewajiban pengujian setiap UI (`*.test.tsx`), runner `bun test`, pola co-location, 7 pilar pengujian UI, dan checklist audit UI.                                                                       | 🔴 **MUTLAK** |
| [**`ai-guidelines.md`**](ai-guidelines.md)   | **Panduan Standar UI/UX & Lokalisasi**: Kursor pointer untuk seluruh elemen interaktif, larangan dialog native browser (`window.confirm`), konfirmasi kustom `<ConfirmDialog>`, skeleton loading, dan istilah baku Bahasa Indonesia.                               | 🔴 **MUTLAK** |

### B. Spesifikasi Arsitektur Sistem & Kontrak Data (System Architecture & Contracts)

| Dokumen                                                    | Deskripsi & Fokus AI Agent                                                                                                                                                                                                                       |   Tingkat Wajib    |
| :--------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------: |
| [**`roles-and-features.md`**](roles-and-features.md)       | **Matriks Otorisasi RBAC & Fitur Sistem**: Hak akses peran (`ADMIN`, `DEVELOPER`, `CLIENT`), skema relasi basis data Prisma, aturan mutasi ledger finansial, serta proteksi API Routes & Server Actions.                                         |   🔴 **MUTLAK**    |
| [**`routes-and-navigation.md`**](routes-and-navigation.md) | **Sistem Rute Sentralisasi (Zero Hardcoded Routes)**: Struktur konstanta rute terpusat pada `lib/routes.ts` (`PUBLIC_ROUTES`, `AUTH_ROUTES`, `DASHBOARD_ROUTES`, `ADMIN_ROUTES`, `API_ROUTES`).                                                  |   🔴 **MUTLAK**    |
| [**`deployment.md`**](deployment.md)                       | **Infrastruktur Multi-Stack VPS & Lingkungan Produksi**: Konfigurasi Docker multi-stage (Bun), arsitektur multi-stack staging & produksi di VPS (`45.66.153.149`), dual-bot architecture, penjadwalan crontab container, dan CI/CD dual trigger. | 🟡 **KONDISIONAL** |
| [**`brand-context.md`**](brand-context.md)                 | **Konteks Brand & Terminologi**: Nilai perusahaan, pedoman warna, tipografi, dan terminologi resmi Aldera Tech.                                                                                                                                  |  🟢 **REFERENSI**  |

---

## 3. Urutan Membaca bagi AI Agent Baru (Reading Hierarchy)

Sebelum mulai mengerjakan tugas, AI Agent direkomendasikan membaca dokumen dengan urutan berikut:

1. [`AGENTS.md`](../AGENTS.md) — Aturan ringkas root level dan larangan kritis.
2. [`agent-workflow.md`](agent-workflow.md) — Alur kerja git branch, PR, dan checklist penyelesaian task.
3. [`code-quality.md`](code-quality.md) — Standar arsitektur dan pola penulisan kode.
4. [`roles-and-features.md`](roles-and-features.md) & [`routes-and-navigation.md`](routes-and-navigation.md) — Jika memodifikasi rute, backend, aksi, atau otorisasi.
5. [`ui-testing.md`](ui-testing.md) — Jika menambahkan atau memodifikasi antarmuka visual (UI).

---

## 4. Pemisahan Arsip Desain & Aset Visual (`design-docs/`)

Seluruh berkas catatan visual spesifik antarmuka halaman publik (`*-ui.md`) dan log prompt generator gambar/maskot (`*-artwork.md`, `*-mascot.md`) telah dipisahkan ke dalam direktori khusus [**`design-docs/`**](../design-docs/README.md). Pemisahan ini menjaga repositori `ai-agent-docs/` tetap murni dan ringkas sebagai standar rekayasa perangkat lunak, sembari tetap memelihara arsip estetika bagi tim desain grafis dan UI/UX.
