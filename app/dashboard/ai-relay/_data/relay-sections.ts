import {
  Activity,
  Calculator,
  Cpu,
  CreditCard,
  Key,
  Layers,
  Send,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import type { RelayTabKey } from "../_hooks/use-relay-workspace";

export const RELAY_SECTIONS = [
  {
    value: "catalog",
    label: "Katalog Model",
    description:
      "Pilih model berdasarkan kegunaan, tarif, dan batas konteks. Lanjutkan ke IDE atau Playground saat Anda siap.",
    icon: Layers,
  },
  {
    value: "playground",
    label: "Playground Chat",
    description:
      "Uji prompt, baca respons, dan pantau token serta biaya dari penggunaan Anda.",
    icon: Terminal,
  },
  {
    value: "keys",
    label: "API Keys",
    description:
      "Kelola kunci akses yang menghubungkan IDE dan aplikasi Anda ke AI Relay.",
    icon: Key,
  },
  {
    value: "billing",
    label: "Saldo & Ledger",
    description:
      "Pantau saldo Rupiah, ajukan top-up, dan periksa riwayat mutasi akun Anda.",
    icon: CreditCard,
  },
  {
    value: "telegram",
    label: "Telegram Bot",
    description: "Hubungkan akun Telegram Anda dengan layanan Aldera AI Relay.",
    icon: Send,
  },
  {
    value: "analytics",
    label: "Analitik & Log",
    description:
      "Baca ringkasan token, biaya, dan catatan permintaan yang tersedia pada akun Anda.",
    icon: Activity,
  },
  {
    value: "simulator",
    label: "Komparasi & Simulasi",
    description:
      "Bandingkan model dan rencanakan anggaran berdasarkan parameter pemakaian Anda.",
    icon: Calculator,
  },
  {
    value: "health",
    label: "Status & Latensi",
    description:
      "Periksa status, latensi, dan throughput model berdasarkan catatan permintaan yang tersedia.",
    icon: Cpu,
  },
] satisfies ReadonlyArray<{
  value: RelayTabKey;
  label: string;
  description: string;
  icon: LucideIcon;
}>;
