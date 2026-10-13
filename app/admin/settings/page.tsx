import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { getPricingPlans, getSiteSettings } from "@/lib/public-settings";
import { ADMIN_ROUTES } from "@/lib/routes";
import { SettingsForm } from "./_components/settings-form";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(ADMIN_ROUTES.home);
  }

  const [settings, pricingPlans] = await Promise.all([
    getSiteSettings(),
    getPricingPlans(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings Website</h1>
        <p className="text-muted-foreground">
          Kelola informasi publik, kontak, sosial, SEO, dan harga paket.
        </p>
      </div>

      <Card className="overflow-hidden border-slate-200 bg-white p-0 shadow-sm">
        <SettingsForm settings={settings} pricingPlans={pricingPlans} />
      </Card>
    </div>
  );
}
