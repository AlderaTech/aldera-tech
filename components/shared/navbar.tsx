"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { ArrowUpRight, Menu } from "lucide-react";
import type { Session } from "next-auth";

import { Logo } from "@/components/shared/logo";
import { NavbarLinks } from "@/components/shared/navbar-links";
import { UserMenu } from "@/components/shared/user-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import studioStyles from "./studio-navbar.module.css";

export function Navbar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();
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
  const transparent = usesStudioChrome && !scrolled;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "tech-playful sticky top-4 z-40 mx-auto mt-4 w-[calc(100%-2rem)] max-w-[90rem] rounded-2xl border border-brand-divider/80 font-jakarta text-brand-navy backdrop-blur-md transition-[background-color,box-shadow] duration-300 motion-reduce:transition-none lg:w-[calc(100%-4rem)]",
        usesStudioChrome && studioStyles.navbar,
        isServicesPage && studioStyles.servicesNavbar,
        isPortfolioPage && studioStyles.portfolioNavbar,
        isAiRelayPage && studioStyles.aiRelayNavbar,
        isPricingPage && studioStyles.pricingNavbar,
        isBlogPage && studioStyles.blogNavbar,
        isContactPage && studioStyles.contactNavbar,
        usesStudioChrome && scrolled && studioStyles.scrolled,
        transparent
          ? isServicesPage ||
            isPortfolioPage ||
            isAiRelayPage ||
            isPricingPage ||
            isBlogPage ||
            isContactPage
            ? "bg-transparent"
            : "bg-brand-surface/80"
          : "bg-brand-surface/90",
        scrolled && !transparent
          ? "shadow-lg shadow-brand-navy/8"
          : "shadow-sm shadow-brand-navy/3"
      )}
    >
      <div className="mx-auto flex h-16 w-full items-center justify-between gap-2 px-3 sm:h-[72px] sm:gap-4 sm:px-5 lg:px-6">
        <Logo
          size="sm"
          variant="light"
          className={cn(
            "gap-2 [&>span]:text-sm sm:[&>span]:text-lg",
            usesStudioChrome && studioStyles.brand
          )}
        />

        <NavbarLinks
          pathname={pathname}
          modern={usesStudioChrome}
          reduceMotion={shouldReduceMotion ?? false}
        />

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {session?.user ? (
            <UserMenu session={session} />
          ) : (
            <>
              <Button
                asChild
                size="sm"
                className={cn(
                  "h-11 rounded-full bg-brand-navy px-2.5 text-xs font-bold text-white hover:bg-brand-navy-light motion-reduce:active:scale-100 sm:hidden",
                  usesStudioChrome && studioStyles.consultation
                )}
              >
                <Link href={PUBLIC_ROUTES.contact}>Konsultasi</Link>
              </Button>
              <div className="hidden items-center gap-2 sm:flex">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-10 rounded-full border border-brand-divider/80 bg-white px-4 font-semibold text-brand-navy shadow-xs hover:bg-slate-50 hover:text-brand-navy-light motion-reduce:active:scale-100",
                    usesStudioChrome && studioStyles.login
                  )}
                >
                  <Link href={AUTH_ROUTES.login}>Masuk</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className={cn(
                    "h-10 rounded-full bg-brand-navy px-5 font-bold text-white shadow-sm hover:bg-brand-navy-light motion-reduce:active:scale-100",
                    usesStudioChrome && studioStyles.consultation
                  )}
                >
                  <Link href={PUBLIC_ROUTES.contact}>
                    Konsultasi
                    {usesStudioChrome && (
                      <span className={studioStyles.consultationIcon}>
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </span>
                    )}
                  </Link>
                </Button>
              </div>
            </>
          )}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-11 rounded-xl text-brand-navy hover:bg-brand-canvas motion-reduce:active:scale-100 xl:hidden",
                  usesStudioChrome && studioStyles.menuTrigger
                )}
                aria-label="Buka menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              aria-describedby={undefined}
              className={cn(
                "tech-playful flex w-[90%] max-w-sm flex-col overflow-y-auto border-brand-divider bg-brand-surface font-jakarta text-brand-navy",
                usesStudioChrome && studioStyles.drawer
              )}
            >
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              <Logo size="md" />
              <NavbarLinks
                pathname={pathname}
                modern={usesStudioChrome}
                mobile
              />
              {!session?.user && (
                <div
                  className={cn(
                    "flex flex-col gap-2 border-t pt-4",
                    usesStudioChrome && studioStyles.drawerActions
                  )}
                >
                  <SheetClose asChild>
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 rounded-full motion-reduce:active:scale-100"
                    >
                      <Link href={AUTH_ROUTES.login}>Masuk</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      asChild
                      className="h-11 rounded-full bg-brand-cyan font-bold text-brand-navy hover:bg-brand-cyan-hover motion-reduce:active:scale-100"
                    >
                      <Link href={PUBLIC_ROUTES.contact}>Konsultasi</Link>
                    </Button>
                  </SheetClose>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
