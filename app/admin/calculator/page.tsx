import { AdminBanner } from "@/app/admin/_components/admin-banner";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { ADMIN_ROUTES } from "@/lib/routes";
import { Badge } from "@/components/ui/badge";
import { AdminMascot } from "../_components/admin-mascot";
import { CalculatorAdmin } from "./_components/calculator-admin";

type Props = {
  searchParams?: Promise<{ tab?: string }>;
};

export default async function AdminCalculatorPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(ADMIN_ROUTES.home);
  }

  const resolvedParams = searchParams ? await searchParams : undefined;
  const initialTab = resolvedParams?.tab || "types";

  const data = await safeDb(
    async () => {
      const [projectTypes, features, addOns, config] = await Promise.all([
        prisma.projectType.findMany({ orderBy: { order: "asc" } }),
        prisma.featureOption.findMany({
          orderBy: { order: "asc" },
          include: { projectType: { select: { name: true } } },
        }),
        prisma.addOnOption.findMany({ orderBy: { order: "asc" } }),
        prisma.calculatorConfig.findUnique({ where: { id: "calculator" } }),
      ]);

      return {
        projectTypes: projectTypes.map((pt) => ({
          ...pt,
          basePrice: Number(pt.basePrice),
        })),
        features: features.map((f) => ({
          ...f,
          price: Number(f.price),
        })),
        addOns: addOns.map((a) => ({
          ...a,
          pricePerMonth: Number(a.pricePerMonth),
        })),
        config: config
          ? {
              ...config,
              revisionPricePerItem: Number(config.revisionPricePerItem),
              urgencyMultiplier: Number(config.urgencyMultiplier),
            }
          : null,
      };
    },
    { projectTypes: [], features: [], addOns: [], config: null }
  );

  return (
    <div className="space-y-5">
      <AdminBanner
        data-admin-page-header
        className="flex flex-wrap items-center justify-between gap-4"
        category="estimates"
        mascot={<AdminMascot pose="coding" size="header" />}
      >
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Kalkulator Harga
            </h1>
            <Badge variant="outline" className="bg-white text-xs font-medium">
              Konfigurasi Estimasi
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Kelola jenis proyek, fitur, opsi pemeliharaan, dan kebijakan
            perhitungan estimasi biaya klien.
          </p>
        </div>
      </AdminBanner>
      <CalculatorAdmin data={data} initialTab={initialTab} />
    </div>
  );
}
