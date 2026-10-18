import type { OrderRequestStatus } from "@prisma/client";

export const orderStatusMeta = {
  PENDING: { label: "Menunggu Review", variant: "default" },
  REVIEWED: { label: "Sedang Diproses", variant: "secondary" },
  CONVERTED: { label: "Dikonversi ke Proposal", variant: "success" },
  CANCELLED: { label: "Dibatalkan", variant: "destructive" },
} satisfies Record<
  OrderRequestStatus,
  {
    label: string;
    variant: "default" | "secondary" | "success" | "destructive";
  }
>;
