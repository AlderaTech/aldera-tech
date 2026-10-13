"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import type { Session } from "next-auth";

import { Logo } from "@/components/shared/logo";
import { UserMenu } from "@/components/shared/user-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { publicNavLinks } from "@/lib/nav-config";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function Navbar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "public-container-px sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-all",
        transparent
          ? "border-transparent bg-transparent shadow-none"
          : "border-black/10 bg-[#f4f2ea]/95",
        scrolled && !transparent
          ? "shadow-[0_10px_28px_rgba(8,9,13,0.06)]"
          : "shadow-none"
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-[72px] w-full max-w-screen-xxxl items-center justify-between transition-all",
          transparent ? "text-white" : "text-[#08090d]"
        )}
      >
        <Logo size="md" variant={transparent ? "dark" : "light"} />

        <nav className="relative hidden items-center gap-7 xl:flex">
          {publicNavLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-2 text-sm font-semibold transition-colors",
                  active
                    ? "text-[#0b6bff]"
                    : transparent
                      ? "text-white/72 hover:text-white"
                      : "text-black/62 hover:text-black"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[#0b6bff]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <UserMenu session={session} />
          ) : (
            <>
              <Button
                asChild
                size="sm"
                className="bg-[#0b6bff] font-bold text-white hover:bg-[#075bd8] sm:hidden"
              >
                <Link href={PUBLIC_ROUTES.contact}>Konsultasi</Link>
              </Button>
              <div className="hidden items-center gap-2 sm:flex">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "font-semibold",
                    transparent
                      ? "text-white/72 hover:bg-white/10 hover:text-white"
                      : "text-black/58 hover:bg-black/5 hover:text-black"
                  )}
                >
                  <Link href={AUTH_ROUTES.login}>Masuk</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className={cn(
                    "font-bold text-white",
                    transparent
                      ? "bg-white/15 backdrop-blur-md hover:bg-white/25"
                      : "bg-[#08090d] hover:bg-black"
                  )}
                >
                  <Link href={PUBLIC_ROUTES.contact}>Konsultasi</Link>
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
                  "xl:hidden",
                  transparent ? "hover:bg-white/10" : "hover:bg-black/5"
                )}
                aria-label="Buka menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[85%] flex-col xs:w-80"
            >
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              <Logo size="md" />
              <nav className="mt-6 flex flex-1 flex-col gap-1">
                {publicNavLinks.map((link) => {
                  const active =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(link.href);
                  return (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "rounded-md px-3 py-2.5 text-base font-semibold transition-colors",
                          active
                            ? "bg-[#0b6bff]/10 text-[#0b6bff]"
                            : "text-black/65 hover:bg-black/5 hover:text-black"
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  );
                })}
              </nav>
              {!session?.user && (
                <div className="flex flex-col gap-2 border-t pt-4">
                  <SheetClose asChild>
                    <Button asChild variant="outline">
                      <Link href={AUTH_ROUTES.login}>Masuk</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      asChild
                      className="bg-[#0b6bff] text-white hover:bg-[#075bd8]"
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
