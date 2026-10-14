import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROUTES } from "@/lib/routes";
import { safeDb } from "@/lib/safe-db";
import { PortfolioStatGrid } from "./_components/portfolio-stat-grid";
import { PortfolioTable } from "./_components/portfolio-table";

export default async function AdminPortfolioPage() {
  const caseStudies = await safeDb(
    async () =>
      await prisma.caseStudy.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Portfolio & Case Studies
          </h1>
          <p className="text-muted-foreground">
            Kelola studi kasus dan etalase karya digital yang tampil di website
            publik.
          </p>
        </div>
        <Button
          asChild
          className="bg-brand-primary hover:bg-brand-primary-hover gap-1.5 text-white"
        >
          <Link href={ADMIN_ROUTES.portfolioNew}>
            <Plus className="size-4" /> Tambah Studi Kasus
          </Link>
        </Button>
      </div>

      <PortfolioStatGrid items={caseStudies} />

      <Card className="overflow-hidden border p-0 shadow-sm">
        <PortfolioTable items={caseStudies} />
      </Card>
    </div>
  );
}
