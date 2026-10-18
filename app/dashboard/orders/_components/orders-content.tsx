import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { OrderCard } from "./order-card";
import { OrdersEmptyState } from "./orders-empty-state";
import { OrdersLoadError } from "./orders-load-error";
import commonStyles from "../../projects/_components/project-list.module.css";
import styles from "./orders.module.css";

type OrderWithProjectType = Prisma.OrderRequestGetPayload<{
  include: { projectType: { select: { name: true } } };
}>;

export async function OrdersContent() {
  const session = await auth();
  const userId = session!.user.id;

  const orders = await safeDb<OrderWithProjectType[] | null>(
    async () =>
      prisma.orderRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { projectType: { select: { name: true } } },
      }),
    null
  );

  if (orders === null) return <OrdersLoadError />;
  if (orders.length === 0) return <OrdersEmptyState />;

  return (
    <div>
      <div className={commonStyles.listBar}>
        <h2 id="orders-list-heading">
          Pengajuan Anda <span>{orders.length}</span>
        </h2>
        <p>Urutan pengajuan terbaru</p>
      </div>
      <ul className={styles.list} aria-labelledby="orders-list-heading">
        {orders.map((order) => (
          <li key={order.id}>
            <OrderCard order={order} />
          </li>
        ))}
      </ul>
    </div>
  );
}
