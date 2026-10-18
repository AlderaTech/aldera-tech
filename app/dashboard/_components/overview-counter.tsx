"use client";

import { useReducedMotion } from "framer-motion";
import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import { formatCurrency } from "@/lib/utils";

export function OverviewCounter({
  value,
  currency = false,
}: {
  value: number;
  currency?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion)
    return <span>{currency ? formatCurrency(value) : value}</span>;

  return (
    <AnimatedCounter value={value} format={currency ? "currency" : "number"} />
  );
}
