export type AuthVariant = "login" | "register" | "forgot" | "reset";

export type AuthPanelCopy = {
  title: string;
  description: string;
  bullets: string[];
  status: string;
};

export const authPanelCopy: Record<AuthVariant, AuthPanelCopy> = {
  login: {
    title: "Dashboard proyek yang transparan sejak hari pertama.",
    description:
      "Masuk untuk melihat milestone, invoice, dokumen, dan update kerja dalam satu tempat.",
    bullets: [
      "Papan progres langsung",
      "Rincian invoice jelas",
      "Handoff terdokumentasi",
    ],
    status: "Ruang kerja klien siap",
  },
  register: {
    title: "Mulai workspace digital untuk proyek berikutnya.",
    description:
      "Buat akun agar tim Solvo Tech bisa menyiapkan ruang kerja, scope, dan komunikasi proyek Anda.",
    bullets: [
      "Akses dashboard klien",
      "Brief awal lebih rapi",
      "Riwayat komunikasi tersimpan",
    ],
    status: "Penyiapan ruang kerja",
  },
  forgot: {
    title: "Akses akun tetap aman dan mudah dipulihkan.",
    description:
      "Kami mengirim link reset hanya jika email terdaftar, sehingga akun tetap terlindungi.",
    bullets: [
      "Link reset terbatas waktu",
      "Tidak membuka status email",
      "Alur kembali ke login",
    ],
    status: "Pemulihan aman",
  },
  reset: {
    title: "Buat password baru dan lanjutkan pekerjaan.",
    description:
      "Gunakan password yang kuat agar akses ke dashboard proyek tetap aman.",
    bullets: [
      "Validasi token reset",
      "Password minimal 8 karakter",
      "Kembali otomatis ke masuk",
    ],
    status: "Pembaruan password",
  },
};
