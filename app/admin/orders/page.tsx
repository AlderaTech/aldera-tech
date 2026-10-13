import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { ADMIN_ROUTES } from "@/lib/routes";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderActions } from "./_components/order-actions";

const statusMeta: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "success" | "destructive";
  }
> = {
  PENDING: { label: "Pending", variant: "default" },
  REVIEWED: { label: "Reviewed", variant: "secondary" },
  CONVERTED: { label: "Converted", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect(ADMIN_ROUTES.home);
  }

  const orders = await safeDb(
    async () =>
      prisma.orderRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          projectType: { select: { name: true } },
        },
      }),
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order Requests</h1>
        <p className="text-muted-foreground">
          Estimasi proyek yang diajukan klien dari kalkulator harga.
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          Belum ada order request.
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const meta = statusMeta[order.status];
            const features = order.features as string[];
            const customFeatures = order.customFeatures as { name: string }[];
            const addOns = order.addOns as {
              addOnId: string;
              months: number;
            }[];
            return (
              <Card key={order.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{order.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {order.user.email}
                      </span>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                      {order.urgency === "urgent" && (
                        <Badge className="bg-amber-500 text-white">
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {order.projectType.name} • {formatDate(order.createdAt)} •{" "}
                      {features.length + customFeatures.length} fitur •{" "}
                      {addOns.length} add-on
                    </div>
                    {order.notes && (
                      <p className="mt-2 text-sm">{order.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {formatCurrency(Number(order.estimatedTotal))}
                    </div>
                    <OrderActions id={order.id} status={order.status} />
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
