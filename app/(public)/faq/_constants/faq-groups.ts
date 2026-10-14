export type FaqItem = {
  q: string;
  a: string;
};

export type FaqGroup = {
  title: string;
  items: FaqItem[];
};

export const faqGroups: FaqGroup[] = [
  {
    title: "Umum",
    items: [
      {
        q: "Apa itu Aldera Tech?",
        a: "Aldera Tech adalah partner teknologi yang membantu bisnis Indonesia membangun web, aplikasi mobile, dan solusi digital lainnya, dengan transparansi penuh melalui dashboard langsung.",
      },
      {
        q: "Dari mana Aldera Tech berasal?",
        a: "Kami berbasis di Indonesia dan melayani klien di seluruh nusantara serta regional Asia Tenggara.",
      },
      {
        q: "Apakah kami cocok untuk startup?",
        a: "Sangat cocok. Banyak klien kami adalah startup tahap awal yang butuh partner teknologi yang fleksibel dan reliabel.",
      },
    ],
  },
  {
    title: "Layanan",
    items: [
      {
        q: "Teknologi apa yang kalian pakai?",
        a: "Teknologi utama: Next.js, React, TypeScript, PostgreSQL, Prisma, dan Tailwind CSS. Untuk mobile: React Native. Pilihan teknologi bisa disesuaikan jika proyek Anda sudah punya kebutuhan khusus.",
      },
      {
        q: "Apakah menyediakan pemeliharaan setelah rilis?",
        a: "Ya, kami menawarkan paket pemeliharaan bulanan, pemantauan, pembaruan kecil, dan perbaikan bug. Detail bisa didiskusikan di tahap proposal.",
      },
      {
        q: "Bisakah mengambil alih proyek yang sudah berjalan?",
        a: "Bisa. Kami melakukan audit kode dulu untuk memahami kondisi proyek, lalu memberikan rekomendasi dan peta jalan.",
      },
    ],
  },
  {
    title: "Harga",
    items: [
      {
        q: "Apakah harga di website sudah final?",
        a: "Harga yang tertera adalah harga mulai. Harga final disesuaikan dengan cakupan, tapi kami selalu memberikan rincian transparan sebelum kontrak.",
      },
      {
        q: "Apa metode pembayaran yang diterima?",
        a: "Transfer bank, kartu kredit/debit via Midtrans, atau invoice email. Biasanya 50% di awal, 50% saat serah terima.",
      },
      {
        q: "Apakah ada garansi uang kembali?",
        a: "Ada garansi revisi selama periode pengembangan. Untuk pengembalian dana, kami diskusikan sesuai perjanjian proyek.",
      },
    ],
  },
  {
    title: "Proses",
    items: [
      {
        q: "Seperti apa alur kerja proyek?",
        a: "1) Sesi discovery, 2) Proposal dan kontrak, 3) Fase desain, 4) Pengembangan dengan dashboard pelacakan, 5) Review dan QA, 6) Rilis, 7) Pemeliharaan opsional.",
      },
      {
        q: "Seberapa sering progres diperbarui?",
        a: "Pembaruan mingguan wajib lewat dashboard dan panggilan singkat. Anda bisa cek progres kapan saja tanpa harus menunggu laporan.",
      },
      {
        q: "Bagaimana jika butuh perubahan di tengah jalan?",
        a: "Perubahan cakupan dikomunikasikan dulu. Dampaknya ke waktu dan anggaran akan jelas sebelum kami lanjutkan. Tanpa kejutan.",
      },
    ],
  },
];
