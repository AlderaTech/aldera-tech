"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import styles from "./pricing-calculator.module.css";

export function CalculatorChoice({
  studio = false,
  selected,
  onSelect,
  className,
  children,
}: {
  studio?: boolean;
  selected: boolean;
  onSelect: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card
      className={cn(className, studio && styles.choice)}
      onClick={onSelect}
      role={studio ? "button" : undefined}
      tabIndex={studio ? 0 : undefined}
      aria-pressed={studio ? selected : undefined}
      onKeyDown={
        studio
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
    >
      {children}
    </Card>
  );
}
