export type AuthVariant = "register" | "reset";

export type AuthPanelCopy = {
  title: string;
  description: string;
  bullets: string[];
  status: string;
};

export const authPanelCopy: Record<AuthVariant, AuthPanelCopy> = {
  register: {
    title: "Mulai workspace digital untuk proyek berikutnya.",
    description:
      "Buat akun agar tim Aldera Tech bisa menyiapkan ruang kerja, scope, dan komunikasi proyek Anda.",
    bullets: [
      "Akses dashboard klien",
      "Brief awal lebih rapi",
      "Riwayat komunikasi tersimpan",
    ],
    status: "Penyiapan ruang kerja",
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
