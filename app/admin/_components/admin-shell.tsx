"use client";

import { type ReactNode } from "react";
import { useWorkspacePortalTheme } from "@/components/dashboard/use-workspace-portal-theme";
import controls from "@/components/dashboard/workspace-controls.module.css";
import { cn } from "@/lib/utils";
import chrome from "@/components/dashboard/overview-chrome.module.css";
import theme from "./admin-theme.module.css";
import surfaces from "./admin-surfaces.module.css";
import layout from "./admin-chrome.module.css";

const portalClasses = [
  chrome.scope,
  controls.scope,
  theme.scope,
  surfaces.scope,
  layout.portalScope,
];
export function AdminShell({ children }: { children: ReactNode }) {
  useWorkspacePortalTheme(portalClasses, "data-admin-studio");
  return (
    <div
      className={cn(
        chrome.scope,
        controls.scope,
        theme.scope,
        surfaces.scope,
        layout.shell
      )}
      data-admin-workspace
    >
      {children}
    </div>
  );
}
