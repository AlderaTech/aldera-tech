export const ADMIN_EMPTY_CONTEXTS = {
  general: {
    label: "DATA ADMIN",
    title: "Belum ada data",
    description: "Data yang tersedia akan ditampilkan di bagian ini.",
  },
  projects: {
    label: "DATA PROYEK",
    title: "Belum ada proyek",
    description:
      "Belum ada proyek untuk ditampilkan, atau belum ada yang sesuai dengan pencarian dan filter.",
  },
  orders: {
    label: "PERMOHONAN PESANAN",
    title: "Belum ada permohonan pesanan",
    description:
      "Permohonan dari kalkulator proyek yang sesuai dengan pencarian dan filter akan ditampilkan di sini.",
  },
  proposals: {
    label: "DAFTAR PROPOSAL",
    title: "Belum ada proposal",
    description:
      "Proposal yang sesuai dengan pencarian dan filter akan ditampilkan di bagian ini.",
  },
  invoices: {
    label: "DATA TAGIHAN",
    title: "Belum ada invoice",
    description:
      "Invoice yang tersedia dan sesuai dengan pencarian serta filter akan ditampilkan di sini.",
  },
  recurring: {
    label: "TEMPLATE TAGIHAN",
    title: "Belum ada template tagihan",
    description:
      "Template yang dibuat akan digunakan untuk menerbitkan tagihan sesuai jadwal.",
  },
  timesheet: {
    label: "CATATAN WAKTU",
    title: "Belum ada catatan waktu",
    description:
      "Catatan jam kerja pada rentang tanggal yang dipilih akan ditampilkan di sini.",
  },
  files: {
    label: "MANAJEMEN BERKAS",
    title: "Belum ada berkas",
    description:
      "Berkas proyek yang tersedia dan sesuai dengan pencarian akan ditampilkan di sini.",
  },
  activity: {
    label: "AKTIVITAS TERBARU",
    title: "Belum ada aktivitas",
    description:
      "Pembaruan dan aktivitas proyek akan ditampilkan di bagian ini.",
  },
  milestones: {
    label: "TAHAPAN PROYEK",
    title: "Belum ada tahapan proyek",
    description:
      "Tahapan dan target pengerjaan proyek yang ditambahkan akan ditampilkan di sini.",
  },
  revenue: {
    label: "RINGKASAN PENDAPATAN",
    title: "Belum ada data pendapatan",
    description:
      "Data pendapatan pada periode yang dipilih akan ditampilkan di sini.",
  },
  clients: {
    label: "PENDAPATAN KLIEN",
    title: "Belum ada data klien",
    description:
      "Peringkat klien ditampilkan berdasarkan invoice yang berstatus lunas.",
  },
  projectStatus: {
    label: "STATUS PROYEK",
    title: "Belum ada proyek",
    description:
      "Distribusi status akan ditampilkan ketika data proyek tersedia.",
  },
  models: {
    label: "KATALOG MODEL",
    title: "Tidak ada model yang sesuai",
    description:
      "Sesuaikan kata kunci pencarian untuk melihat model yang tersedia.",
  },
  sync: {
    label: "SINKRONISASI MODEL",
    title: "Tidak ada model baru",
    description:
      "Tidak ada model tambahan dari penyedia pada hasil sinkronisasi ini.",
  },
  topups: {
    label: "TIKET PENGISIAN SALDO",
    title: "Tidak ada tiket top-up menunggu",
    description:
      "Permintaan pengisian saldo yang menunggu pemeriksaan akan ditampilkan di antrean ini.",
  },
  ledger: {
    label: "INTEGRITAS BUKU BESAR",
    title: "Belum ada hasil pemeriksaan",
    description:
      "Hasil pemeriksaan integritas akan ditampilkan setelah pemeriksaan tersedia.",
  },
  logs: {
    label: "CATATAN AUDIT",
    title: "Belum ada catatan audit",
    description:
      "Catatan aktivitas yang sesuai dengan pencarian dan filter akan ditampilkan di sini.",
  },
  blog: {
    label: "MANAJEMEN KONTEN",
    title: "Belum ada artikel blog",
    description:
      "Artikel yang tersedia dan sesuai dengan pencarian serta filter akan ditampilkan di sini.",
  },
  categories: {
    label: "KATEGORI ARTIKEL",
    title: "Belum ada kategori blog",
    description:
      "Kategori yang tersedia akan digunakan untuk mengelompokkan artikel.",
  },
  portfolio: {
    label: "STUDI KASUS",
    title: "Belum ada studi kasus",
    description:
      "Studi kasus yang sesuai dengan pencarian dan filter akan ditampilkan di sini.",
  },
  testimonials: {
    label: "TESTIMONI KLIEN",
    title: "Belum ada testimoni",
    description:
      "Testimoni yang tersedia dan sesuai dengan filter akan ditampilkan di sini.",
  },
  users: {
    label: "PENGGUNA & TIM",
    title: "Belum ada pengguna",
    description:
      "Pengguna pada kategori yang dipilih akan ditampilkan di bagian ini.",
  },
  workload: {
    label: "BEBAN KERJA TIM",
    title: "Belum ada anggota tim aktif",
    description:
      "Anggota tim aktif dan beban proyeknya akan ditampilkan di bagian ini.",
  },
  projectTypes: {
    label: "JENIS PROYEK",
    title: "Belum ada jenis proyek",
    description:
      "Tambahkan jenis proyek melalui formulir untuk menyediakannya di kalkulator.",
  },
  features: {
    label: "FITUR PROYEK",
    title: "Belum ada fitur untuk kategori ini",
    description:
      "Tambahkan fitur melalui formulir untuk menyediakannya di kalkulator.",
  },
  addons: {
    label: "OPSI TAMBAHAN",
    title: "Belum ada opsi tambahan",
    description:
      "Tambahkan opsi tambahan atau pemeliharaan melalui formulir yang tersedia.",
  },
  methods: {
    label: "METODE PEMBAYARAN",
    title: "Belum ada metode pembayaran",
    description:
      "Tambahkan rekening bank atau QRIS melalui pengaturan yang tersedia.",
  },
} as const;

export type AdminEmptyContext = keyof typeof ADMIN_EMPTY_CONTEXTS;
