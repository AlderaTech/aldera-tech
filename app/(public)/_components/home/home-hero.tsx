"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/lib/routes";

const trustSignals = [
  { value: "50+", label: "Proyek selesai", icon: BarChart3 },
  { value: "30+", label: "Klien puas", icon: CheckCircle2 },
  { value: "1x24", label: "Respon awal", icon: Clock3 },
];

export function HomeHero() {
  const shouldReduceMotion = useReducedMotion();
  const initialUp = shouldReduceMotion ? false : { opacity: 0, y: 22 };
  const initialFade = shouldReduceMotion ? false : { opacity: 0 };

  return (
    <section className="relative isolate h-[calc(100dvh-72px)] overflow-hidden bg-[#08090d] text-white">
      <Image
        src="/generated/solvo-tech/hero-blue-editorial-v2.png"
        alt="Mockup dashboard dan aplikasi digital Solvo Tech"
        fill
        sizes="100vw"
        className="z-0 object-cover object-center lg:object-right"
        preload
      />
      <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(8,9,13,0.94)_0%,rgba(8,9,13,0.82)_38%,rgba(8,9,13,0.46)_68%,rgba(8,9,13,0.22)_100%)]" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_22%_22%,rgba(11,107,255,0.28),transparent_32%)]" />

      <div className="relative z-20 mx-auto flex h-full max-w-screen-xxxl flex-col justify-center public-container-px py-8 sm:py-10">
        <motion.div
          initial={initialUp}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="editorial-kicker border-white/25 bg-white/8 text-white/72 backdrop-blur-md"
        >
          <Sparkles className="size-3.5 text-[#61a3ff]" />
          Solusi digital untuk bisnis modern
        </motion.div>

        <motion.h1
          initial={initialUp}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="editorial-display mt-7 max-w-5xl text-5xl text-balance sm:text-6xl lg:text-7xl xxxl:text-8xl"
        >
          Bangun produk digital yang siap dipakai, bukan sekadar terlihat rapi.
        </motion.h1>

        <motion.p
          initial={initialUp}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-white/72 sm:text-lg"
        >
          Solvo Tech membantu bisnis merancang website, aplikasi, dan sistem
          internal dengan proses yang jelas, visual yang matang, dan handoff
          yang mudah dilanjutkan.
        </motion.p>

        <motion.div
          initial={initialUp}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Button
            asChild
            size="xl"
            className="group bg-[#0b6bff] text-white shadow-xl shadow-[#0b6bff]/25 hover:bg-[#075bd8]"
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
            className="border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/15 hover:text-white"
          >
            <Link href={PUBLIC_ROUTES.portfolio}>Lihat Portfolio</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={initialFade}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.34 }}
          className="mt-12 grid max-w-3xl gap-3 border-t border-white/14 pt-5 sm:grid-cols-3"
        >
          {trustSignals.map((signal) => (
            <div key={signal.label} className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/14 bg-white/10 text-[#61a3ff] backdrop-blur-md">
                <signal.icon className="size-4.5" />
              </div>
              <div>
                <div className="text-2xl font-black leading-none">
                  {signal.value}
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-white/64">
                  {signal.label}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
