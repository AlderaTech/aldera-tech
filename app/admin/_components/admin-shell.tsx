"use client";

import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import chrome from "@/components/dashboard/overview-chrome.module.css";
import theme from "./admin-theme.module.css";
import surfaces from "./admin-surfaces.module.css";
import layout from "./admin-chrome.module.css";

export function AdminShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const body = document.body;
    const previous = body.getAttribute("data-admin-studio");
    const themeClasses = [
      chrome.scope,
      theme.scope,
      surfaces.scope,
      layout.portalScope,
    ];
    const addedClasses = themeClasses.filter(
      (name) => !body.classList.contains(name)
    );
    body.setAttribute("data-admin-studio", "true");
    body.classList.add(...addedClasses);
    return () => {
      if (previous === null) body.removeAttribute("data-admin-studio");
      else body.setAttribute("data-admin-studio", previous);
      body.classList.remove(...addedClasses);
    };
  }, []);
  return (
    <div
      className={cn(chrome.scope, theme.scope, surfaces.scope, layout.shell)}
      data-admin-workspace
    >
      {children}
    </div>
  );
}
