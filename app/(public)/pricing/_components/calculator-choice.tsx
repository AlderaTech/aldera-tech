"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import styles from "./pricing-calculator.module.css";
import dashboardStyles from "./calculator-dashboard.module.css";

export function CalculatorChoice({
  studio = false,
  dashboard = false,
  selected,
  onSelect,
  className,
  children,
}: {
  studio?: boolean;
  dashboard?: boolean;
  selected: boolean;
  onSelect: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card
      className={cn(
        className,
        studio && styles.choice,
        dashboard && dashboardStyles.choice
      )}
      onClick={onSelect}
      role={studio || dashboard ? "button" : undefined}
      tabIndex={studio || dashboard ? 0 : undefined}
      aria-pressed={studio || dashboard ? selected : undefined}
      onKeyDown={
        studio || dashboard
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
