"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/lib/routes";

const trustSignals = [
  { value: "50+", label: "Proyek Dirilis", icon: BarChart3 },
  { value: "98%", label: "Klien Puas & Repeat", icon: CheckCircle2 },
  { value: "1x24", label: "SLA Respon Awal", icon: Clock3 },
];

export function HomeHero() {
  const shouldReduceMotion = useReducedMotion();
  const initialUp = shouldReduceMotion ? false : { opacity: 0, y: 20 };
  const initialFade = shouldReduceMotion ? false : { opacity: 0 };

  return (
    <section className="relative isolate overflow-hidden bg-[#F8FAFC] py-12 lg:py-20">
      {/* Ambient background blur glows */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,177,225,0.12)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 right-0 -z-10 h-[400px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(15,38,58,0.06)_0%,transparent_70%)] blur-2xl" />

      <div className="public-container-px mx-auto max-w-screen-xxxl">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] xl:gap-16">
          {/* Left Column: Heading & CTAs */}
          <div className="flex flex-col justify-center">
            {/* Cyan horizontal pill accent from reference */}
            <motion.div
              initial={initialUp}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className="h-1.5 w-12 rounded-full bg-[#00B1E1]" />
              <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.14em] text-[#0F263A] uppercase">
                <Code2 className="size-3.5 text-[#00B1E1]" />
                Software Engineering & Digital Studio
              </span>
            </motion.div>

            {/* Display Heading matching referensi-landing-oage.jpeg */}
            <motion.h1
              initial={initialUp}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="mt-6 font-serif text-4xl font-extrabold tracking-tight text-[#0F263A] sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Bangun Website & Aplikasi Digital Berkinerja Tinggi.
            </motion.h1>

            <motion.p
              initial={initialUp}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg"
            >
              Aldera Tech merancang dan merekayasa platform digital modern
              dengan standar kualitas Silicon Valley. Proses transparan,
              arsitektur skalabel, dan rilis tepat waktu.
            </motion.p>

            {/* Action Buttons: High-Contrast Pill Buttons */}
            <motion.div
              initial={initialUp}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Button
                asChild
                size="xl"
                className="group rounded-full bg-[#00B1E1] px-8 text-base font-bold text-[#0F263A] shadow-xl shadow-[#00B1E1]/25 transition-all hover:scale-[1.02] hover:bg-[#0094BD]"
              >
                <Link href={PUBLIC_ROUTES.contact}>
                  Konsultasi Gratis
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="xl"
                variant="outline"
                className="rounded-full border-2 border-[#0F263A] bg-transparent px-8 text-base font-bold text-[#0F263A] transition-all hover:bg-[#0F263A] hover:text-white"
              >
                <Link href={PUBLIC_ROUTES.portfolio}>Lihat Portfolio</Link>
              </Button>
            </motion.div>

            {/* Trust Signals Callout */}
            <motion.div
              initial={initialFade}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.34 }}
              className="mt-12 grid grid-cols-3 gap-4 border-t border-slate-200/80 pt-6"
            >
              {trustSignals.map((signal) => (
                <div key={signal.label} className="space-y-1">
                  <div className="font-serif text-2xl font-black text-[#0F263A] sm:text-3xl">
                    {signal.value}
                  </div>
                  <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    {signal.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Organic Curved Visual Showcase Container */}
          <motion.div
            initial={initialUp}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mx-auto w-full max-w-lg lg:max-w-none"
          >
            {/* Organic decorative background shape */}
            <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-gradient-to-tr from-[#00B1E1]/20 via-[#00B1E1]/5 to-transparent blur-xl" />

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white p-2 shadow-2xl shadow-slate-900/10">
              <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
                <Image
                  src="/images/hero/hero-showcase.webp"
                  alt="Aldera Tech Software Engineering & Digital Product Architecture"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
              </div>

              {/* High-tech status floating badge */}
              <div className="absolute bottom-6 left-6 hidden items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/95 px-4 py-2 shadow-lg backdrop-blur-md sm:inline-flex">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00B1E1] opacity-75" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-[#00B1E1]" />
                </span>
                <span className="text-xs font-bold text-[#0F263A]">
                  Modern Cloud Architecture
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
