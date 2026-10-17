"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import styles from "./public-shell.module.css";
import footerStyles from "@/components/shared/studio-footer.module.css";

export function PublicShell({
  children,
  navbar,
  footer,
}: {
  children: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
}) {
  const pathname = usePathname();
  const isServicesPage = pathname === PUBLIC_ROUTES.services;
  const isAiRelayPage = pathname === PUBLIC_ROUTES.aiRelay;
  const isPricingPage = pathname === PUBLIC_ROUTES.pricing;
  const isContactPage = pathname === PUBLIC_ROUTES.contact;
  const isBlogPage =
    pathname === PUBLIC_ROUTES.blog ||
    pathname.startsWith(`${PUBLIC_ROUTES.blog}/`);
  const isPortfolioPage =
    pathname === PUBLIC_ROUTES.portfolio ||
    pathname.startsWith(`${PUBLIC_ROUTES.portfolio}/`);
  const usesStudioChrome =
    pathname === PUBLIC_ROUTES.home ||
    pathname === PUBLIC_ROUTES.about ||
    isServicesPage ||
    isPortfolioPage ||
    isAiRelayPage ||
    isPricingPage ||
    isBlogPage ||
    isContactPage;

  return (
    <div
      className={cn(
        "flex flex-1 flex-col font-jakarta",
        usesStudioChrome && styles.studioTheme,
        isPortfolioPage && styles.portfolioTheme,
        isAiRelayPage && styles.aiRelayTheme,
        isPricingPage && styles.pricingTheme,
        isBlogPage && styles.blogTheme,
        isContactPage && styles.contactTheme
      )}
    >
      {navbar}
      <main className="flex-1">{children}</main>
      <div className={usesStudioChrome ? footerStyles.scope : undefined}>
        {footer}
      </div>
    </div>
  );
}
