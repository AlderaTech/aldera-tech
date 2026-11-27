"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import styles from "./public-shell.module.css";
import footerStyles from "@/components/shared/studio-footer.module.css";
import { usesStudioPublicChrome } from "@/lib/studio-public-routes";

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
  const isHomePage = pathname === PUBLIC_ROUTES.home;
  const isAiRelayPage = pathname === PUBLIC_ROUTES.aiRelay;
  const isPricingPage = pathname === PUBLIC_ROUTES.pricing;
  const isContactPage = pathname === PUBLIC_ROUTES.contact;
  const isStudioHeroPage =
    isPricingPage || isContactPage || pathname === PUBLIC_ROUTES.blog;
  const isBlogDetail = pathname.startsWith(`${PUBLIC_ROUTES.blog}/`);
  const isPortfolioPage =
    pathname === PUBLIC_ROUTES.portfolio ||
    pathname.startsWith(`${PUBLIC_ROUTES.portfolio}/`);
  const usesStudioChrome = usesStudioPublicChrome(pathname);

  return (
    <div
      className={cn(
        "flex flex-1 flex-col font-jakarta",
        usesStudioChrome && styles.studioTheme,
        isHomePage && styles.homeLayout,
        isPortfolioPage && styles.portfolioTheme,
        isAiRelayPage && styles.aiRelayTheme,
        isStudioHeroPage && styles.pageHeroTheme,
        isBlogDetail && styles.blogDetailTheme
      )}
    >
      {navbar}
      <main className="flex-1">{children}</main>
      <div
        className={cn(
          usesStudioChrome && footerStyles.scope,
          isHomePage && styles.homeFooter
        )}
      >
        {footer}
      </div>
    </div>
  );
}
