import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { ADMIN_ROUTES } from "@/lib/routes";
import { CalculatorAdmin } from "./_components/calculator-admin";

export default async function AdminCalculatorPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(ADMIN_ROUTES.home);
  }

  const data = await safeDb(async () => {
    const [projectTypes, features, addOns, config] = await Promise.all([
      prisma.projectType.findMany({ orderBy: { order: "asc" } }),
      prisma.featureOption.findMany({ orderBy: { order: "asc" }, include: { projectType: { select: { name: true } } } }),
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
  }, { projectTypes: [], features: [], addOns: [], config: null });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kalkulator Harga</h1>
        <p className="text-muted-foreground">Kelola jenis proyek, fitur, add-on, dan pengaturan kalkulator.</p>
      </div>
      <CalculatorAdmin data={data} />
    </div>
  );
}
