import { Suspense } from "react";
import type { Metadata } from "next";
import { OrdersFrame } from "./_components/orders-frame";
import { OrdersContent } from "./_components/orders-content";
import { OrdersSkeleton } from "./_components/orders-skeleton";

export const metadata: Metadata = {
  title: "Riwayat Estimasi",
  description: "Pantau estimasi proyek yang pernah Anda ajukan di Aldera Tech.",
};

export interface OrderHistoryPageProps {
  searchParams?: Promise<{
    status?: string;
    page?: string;
  }>;
}

export default async function OrderHistoryPage({
  searchParams,
}: OrderHistoryPageProps = {}) {
  const resolvedParams = searchParams ? await searchParams : undefined;

  return (
    <OrdersFrame>
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent searchParams={resolvedParams} />
      </Suspense>
    </OrdersFrame>
  );
}
