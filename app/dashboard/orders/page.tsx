import Link from "next/link";
import { Calculator } from "lucide-react";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DASHBOARD_ROUTES } from "@/lib/routes";

const statusMeta: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "success" | "destructive";
  }
> = {
  PENDING: { label: "Menunggu Review", variant: "default" },
  REVIEWED: { label: "Sedang Diproses", variant: "secondary" },
  CONVERTED: { label: "Dikonversi ke Proposal", variant: "success" },
  CANCELLED: { label: "Dibatalkan", variant: "destructive" },
};

export default async function OrderHistoryPage() {
  const session = await auth();
  const userId = session!.user.id;

  const orders = await safeDb(
    async () =>
      prisma.orderRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { projectType: { select: { name: true } } },
      }),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Riwayat Estimasi
          </h1>
          <p className="text-muted-foreground">
            Order request yang pernah Anda ajukan.
          </p>
        </div>
        <Button asChild>
          <Link href={DASHBOARD_ROUTES.calculator}>
            <Calculator className="size-4" /> Estimasi Baru
          </Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="flex flex-col items-center p-12 text-center">
          <Calculator className="mb-3 size-10 text-muted-foreground" />
          <h2 className="font-semibold">Belum ada estimasi</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gunakan kalkulator harga untuk menghitung estimasi proyek Anda.
          </p>
          <Button asChild className="mt-4">
            <Link href={DASHBOARD_ROUTES.calculator}>Hitung Estimasi</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const meta = statusMeta[order.status];
            const features = order.features as string[];
            const customFeatures = order.customFeatures as { name: string }[];
            return (
              <Card key={order.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        {order.projectType.name}
                      </span>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                      {order.urgency === "urgent" && (
                        <Badge className="bg-amber-500 text-white">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {formatDate(order.createdAt)} •{" "}
                      {features.length + customFeatures.length} fitur
                    </div>
                    {order.notes && (
                      <p className="mt-2 line-clamp-2 text-sm">{order.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {formatCurrency(Number(order.estimatedTotal))}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
