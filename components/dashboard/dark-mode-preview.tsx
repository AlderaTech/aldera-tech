"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Temporarily overrides the theme while the button is held/toggled.
 * Use case: admin quickly sees how the public site looks in the opposite mode
 * without permanently changing their personal preference.
 */
export function DarkModePreview() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [previewing, setPreviewing] = React.useState(false);
  const originalRef = React.useRef<string | undefined>(undefined);

  function togglePreview() {
    const current = resolvedTheme ?? theme ?? "light";
    if (previewing) {
      setTheme(originalRef.current ?? "system");
      setPreviewing(false);
    } else {
      originalRef.current = theme;
      setTheme(current === "dark" ? "light" : "dark");
      setPreviewing(true);
    }
  }

  const oppositeIsDark = (resolvedTheme ?? "light") === "light";

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={previewing ? "default" : "outline"}
            size="sm"
            onClick={togglePreview}
            aria-pressed={previewing}
            className="gap-2"
          >
            <Eye className="size-3.5" />
            {previewing ? (
              <>
                Keluar preview
                {oppositeIsDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
              </>
            ) : (
              <>
                Preview {oppositeIsDark ? "gelap" : "terang"}
                {oppositeIsDark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Pratinjau tema sebaliknya tanpa mengubah preferensi Anda.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
