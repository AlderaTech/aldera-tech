import type { Metadata } from "next";
import { SettingsOverview } from "./_components/settings-overview";

export const metadata: Metadata = {
  title: "Pengaturan",
  description:
    "Kelola informasi akun dan lihat ketersediaan pengaturan dashboard Aldera Tech.",
};

export default function SettingsPage() {
  return <SettingsOverview />;
}
