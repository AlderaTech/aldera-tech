"use client";

import type { ReactNode } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import chrome from "@/components/dashboard/overview-chrome.module.css";
import styles from "./profile-dialog.module.css";

export function ProfileDialogContent({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <DialogContent
      className={cn(chrome.scope, styles.dialog, className)}
      data-profile-dialog
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {children}
    </DialogContent>
  );
}
