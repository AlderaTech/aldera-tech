import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Sesuaikan preferensi dashboard Anda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifikasi</CardTitle>
          <CardDescription>
            Pengaturan notifikasi email akan hadir sebentar lagi.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
