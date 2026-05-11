import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { CalculatorWizard } from "./_components/calculator-wizard";

export default async function CalculatorPage() {
  const session = await auth();

  const data = await safeDb(async () => {
    const [projectTypes, features, addOns, config] = await Promise.all([
      prisma.projectType.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
      prisma.featureOption.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
      prisma.addOnOption.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
      prisma.calculatorConfig.findUnique({ where: { id: "calculator" } }),
    ]);
    return { projectTypes, features, addOns, config };
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
