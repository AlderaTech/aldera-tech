import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { PortfolioForm } from "../../_components/portfolio-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPortfolioPage({ params }: PageProps) {
  const { id } = await params;

  const caseStudy = await safeDb(
    async () =>
      await prisma.caseStudy.findUnique({
        where: { id },
      }),
    null
  );

  if (!caseStudy) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Studi Kasus</h1>
        <p className="text-muted-foreground">
          Perbarui rincian narasi, teknologi, atau status publikasi portofolio.
        </p>
      </div>
      <PortfolioForm initial={caseStudy} />
    </div>
  );
}
