import { OrdersFrame } from "./_components/orders-frame";
import { OrdersSkeleton } from "./_components/orders-skeleton";

export default function OrdersLoading() {
  return (
    <OrdersFrame>
      <OrdersSkeleton />
    </OrdersFrame>
  );
}
