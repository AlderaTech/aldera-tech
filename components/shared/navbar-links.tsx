"use client";

import { Fragment } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";
import { publicNavLinks } from "@/lib/nav-config";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import styles from "./studio-navbar.module.css";

export function NavbarLinks({
  pathname,
  mobile = false,
  modern = false,
  reduceMotion = false,
}: {
  pathname: string;
  mobile?: boolean;
  modern?: boolean;
  reduceMotion?: boolean;
}) {
  return (
    <nav
      aria-label={mobile ? "Navigasi mobile" : "Navigasi utama"}
      className={cn(
        mobile
          ? "mt-6 flex flex-1 flex-col gap-1"
          : "relative hidden items-center gap-5 xl:flex 2xl:gap-6",
        modern && (mobile ? styles.mobileNav : styles.desktopNav)
      )}
    >
      {publicNavLinks.map((link) => {
        const active =
          link.href === PUBLIC_ROUTES.home
            ? pathname === PUBLIC_ROUTES.home
            : pathname.startsWith(link.href);
        const item = (
          <Link
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              mobile
                ? "rounded-xl px-3 py-3 text-base font-semibold transition-colors"
                : "relative rounded-sm py-2 text-sm font-semibold whitespace-nowrap transition-colors",
              mobile
                ? active
                  ? "bg-brand-cyan/10 text-brand-navy"
                  : "text-brand-navy/70 hover:bg-brand-canvas hover:text-brand-navy"
                : active
                  ? "text-brand-navy"
                  : "text-slate-600 hover:text-brand-cyan-ink"
            )}
          >
            {!mobile && active && (
              <motion.span
                aria-hidden="true"
                layoutId="nav-underline"
                className={
                  modern
                    ? styles.activePill
                    : "absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-hero-blue"
                }
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", bounce: 0.15, duration: 0.4 }
                }
              />
            )}
            {modern ? (
              <span className={styles.linkLabel}>{link.label}</span>
            ) : (
              link.label
            )}
            {modern && mobile && (
              <ArrowUpRight className="size-4" aria-hidden="true" />
            )}
          </Link>
        );

        return mobile ? (
          <SheetClose asChild key={link.href}>
            {item}
          </SheetClose>
        ) : (
          <Fragment key={link.href}>{item}</Fragment>
        );
      })}
    </nav>
  );
}
