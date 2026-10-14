"use client";

import * as React from "react";

export type TurnstileProps = {
  onSuccess?: (token: string) => void;
  onError?: (error: string) => void;
  className?: string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (error: string) => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

export function Turnstile({ onSuccess, onError, className }: TurnstileProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  React.useEffect(() => {
    if (!siteKey) {
      // In dev/test when no site key is provided, notify success with a mock token
      onSuccess?.("dev-mock-token");
      return;
    }

    const scriptId = "cloudflare-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const renderWidget = () => {
      if (window.turnstile && containerRef.current) {
        window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "auto",
          callback: (token: string) => {
            onSuccess?.(token);
          },
          "error-callback": (err: string) => {
            onError?.(err);
          },
        });
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        renderWidget();
      };
      document.head.appendChild(script);
    } else if (window.turnstile) {
      renderWidget();
    }
  }, [siteKey, onSuccess, onError]);

  if (!siteKey) {
    return (
      <input
        type="hidden"
        name="cf-turnstile-response"
        value="dev-mock-token"
      />
    );
  }

  return (
    <div className={className}>
      <div ref={containerRef} />
    </div>
  );
}
