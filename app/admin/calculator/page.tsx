import { Calculator } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { ADMIN_ROUTES } from "@/lib/routes";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calculator className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Kalkulator Harga
                </h1>
                <Badge variant="outline" className="text-xs font-normal">
                  Konfigurasi Estimasi
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Kelola jenis proyek, fitur, add-on retainer, dan kebijakan
                perhitungan estimasi biaya klien.
              </p>
            </div>
          </div>
        </div>
      </div>
      <CalculatorAdmin data={data} initialTab={initialTab} />
    </div>
  );
}
