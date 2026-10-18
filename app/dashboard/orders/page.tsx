import { Suspense } from "react";
import { OrdersFrame } from "./_components/orders-frame";
import { OrdersContent } from "./_components/orders-content";
import { OrdersSkeleton } from "./_components/orders-skeleton";

export default function OrderHistoryPage() {
  return (
    <OrdersFrame>
      <Suspense fallback={<OrdersSkeleton />}>
        <OrdersContent />
      </Suspense>
    </OrdersFrame>
  );
}
