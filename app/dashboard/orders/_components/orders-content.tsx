import type { OrderRequestStatus, Prisma } from "@prisma/client";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { Button } from "@/components/ui/button";
import { DataPagination } from "@/components/shared/data-pagination";
import { OrderCard } from "./order-card";
import { OrderStatusFilter } from "./order-status-filter";
import { OrdersEmptyState } from "./orders-empty-state";
import { OrdersLoadError } from "./orders-load-error";
import commonStyles from "../../projects/_components/project-list.module.css";
import styles from "./orders.module.css";

const ORDERS_PER_PAGE = 6;

const VALID_ORDER_STATUSES: readonly OrderRequestStatus[] = [
  "PENDING",
  "REVIEWED",
  "CONVERTED",
  "CANCELLED",
];

type OrderWithProjectType = Prisma.OrderRequestGetPayload<{
  include: { projectType: { select: { name: true } } };
}>;

export interface OrdersContentProps {
  searchParams?: {
    status?: string;
    page?: string;
  };
}

export async function OrdersContent({ searchParams }: OrdersContentProps = {}) {
  const session = await auth();
  const userId = session!.user.id;

  const rawStatus = searchParams?.status?.trim().toUpperCase();
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);

  const statusFilter =
    rawStatus && VALID_ORDER_STATUSES.includes(rawStatus as OrderRequestStatus)
      ? (rawStatus as OrderRequestStatus)
      : undefined;

  const where: Prisma.OrderRequestWhereInput = {
    userId,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const result = await safeDb<{
    total: number;
    items: OrderWithProjectType[];
  } | null>(async () => {
    const [total, items] = await Promise.all([
      prisma.orderRequest.count({ where }),
      prisma.orderRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * ORDERS_PER_PAGE,
        take: ORDERS_PER_PAGE,
        include: { projectType: { select: { name: true } } },
      }),
    ]);
    return { total, items };
  }, null);

  if (result === null) return <OrdersLoadError />;

  const { total, items: orders } = result;

  if (total === 0 && !statusFilter) {
    return <OrdersEmptyState />;
  }

  return (
    <div>
      <OrderStatusFilter />

      <div className={commonStyles.listBar}>
        <h2 id="orders-list-heading">
          Pengajuan Anda <span>{total}</span>
        </h2>
        <p>Urutan pengajuan terbaru</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-card/50 p-10 text-center shadow-xs">
          <p className="text-sm font-medium text-foreground">
            Tidak ada riwayat estimasi dengan status ini.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Silakan pilih status lain atau tampilkan semua estimasi.
          </p>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mt-4 gap-1.5 text-xs"
          >
            <Link href={DASHBOARD_ROUTES.orders}>
              <RotateCcw className="size-3.5" />
              Reset Filter
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <ul className={styles.list} aria-labelledby="orders-list-heading">
            {orders.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} />
              </li>
            ))}
          </ul>

          <DataPagination
            currentPage={page}
            totalItems={total}
            pageSize={ORDERS_PER_PAGE}
            className="mt-6"
          />
        </>
      )}
    </div>
  );
}
