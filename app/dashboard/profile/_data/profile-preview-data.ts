import type {
  PreviewActivity,
  PreviewPaymentMethod,
  PreviewProject,
} from "../_types/profile-preview";

// Frontend preview only. Never merge these fixtures with the authenticated profile.
export const PROFILE_PREVIEW_LIMITS = { projects: 3, activities: 5 } as const;

export const PROFILE_PREVIEW_PROJECTS: readonly PreviewProject[] = [
  {
    id: "demo-project-web",
    name: "Portal Bisnis",
    description:
      "Website perusahaan dengan katalog layanan dan pengelolaan konten.",
    kind: "web",
    status: "IN_PROGRESS",
    progress: 68,
    startDate: "2026-10-01",
    targetDate: "2026-11-15",
    deliverables: [
      "Rancangan antarmuka",
      "Halaman website responsif",
      "Dokumentasi penggunaan",
    ],
  },
  {
    id: "demo-project-mobile",
    name: "Aplikasi Pelanggan",
    description:
      "Pengalaman mobile untuk akses layanan dan komunikasi pelanggan.",
    kind: "mobile",
    status: "REVIEW",
    progress: 85,
    startDate: "2026-09-15",
    targetDate: "2026-11-05",
    deliverables: [
      "Prototipe interaktif",
      "Alur layanan pelanggan",
      "Catatan hasil review",
    ],
  },
  {
    id: "demo-project-dashboard",
    name: "Dashboard Operasional",
    description:
      "Antarmuka ringkasan operasional dan pengelolaan informasi bisnis.",
    kind: "dashboard",
    status: "COMPLETED",
    progress: 100,
    startDate: "2026-08-20",
    targetDate: "2026-10-20",
    deliverables: [
      "Dashboard responsif",
      "Komponen antarmuka",
      "Dokumen serah terima",
    ],
  },
];

export const PROFILE_PREVIEW_PAYMENTS: readonly PreviewPaymentMethod[] = [
  {
    id: "demo-bank",
    name: "Transfer bank",
    kind: "bank",
    maskedNumber: "•••• 4821",
    description: "Rekening contoh untuk pratinjau tampilan.",
  },
  {
    id: "demo-card",
    name: "Kartu pembayaran",
    kind: "card",
    maskedNumber: "•••• 7710",
    description: "Kartu fiktif. Tidak terhubung ke jaringan pembayaran.",
  },
];

export const PROFILE_PREVIEW_ACTIVITIES: readonly PreviewActivity[] = [
  {
    id: "demo-activity-1",
    kind: "progress",
    description: "Progres Portal Bisnis diperbarui menjadi 68%.",
    occurredAt: "2026-10-27T02:30:00Z",
  },
  {
    id: "demo-activity-2",
    kind: "document",
    description: "Dokumen rancangan Aplikasi Pelanggan siap ditinjau.",
    occurredAt: "2026-10-26T07:15:00Z",
  },
  {
    id: "demo-activity-3",
    kind: "status",
    description: "Dashboard Operasional ditandai selesai pada data demo.",
    occurredAt: "2026-10-25T03:00:00Z",
  },
];
