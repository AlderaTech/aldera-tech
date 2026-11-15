"use client";

import { useEffect } from "react";
import { mountWorkspacePortalTheme } from "./workspace-portal-theme";

export function useWorkspacePortalTheme(
  classes: readonly string[],
  attribute: string,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return;
    return mountWorkspacePortalTheme(document.body, classes, attribute);
  }, [classes, attribute, enabled]);
}
