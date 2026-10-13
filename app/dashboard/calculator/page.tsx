import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { CalculatorWizard } from "./_components/calculator-wizard";

export default async function CalculatorPage() {
  const data = await safeDb(async () => {
    const [projectTypes, features, addOns, config] = await Promise.all([
      prisma.projectType.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
      prisma.featureOption.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
      prisma.addOnOption.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
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
        <p className="text-muted-foreground">Estimasi biaya proyek Anda secara real-time.</p>
      </div>
      <CalculatorWizard data={data} />
    </div>
  );
}
