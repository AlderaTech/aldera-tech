import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Code2,
  MessageSquareText,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";

type ProcessStep = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const processSteps: ProcessStep[] = [
  {
    icon: MessageSquareText,
    title: "Discovery",
    description:
      "Kami memetakan tujuan bisnis, pengguna, prioritas fitur, dan risiko awal.",
  },
  {
    icon: ClipboardList,
    title: "Scope & proposal",
    description:
      "Cakupan, milestone, estimasi, dan deliverable dibuat jelas sebelum masuk build.",
  },
  {
    icon: Code2,
    title: "Build sprint",
    description:
      "Desain, pengembangan, review, dan QA berjalan bertahap dengan komunikasi rutin.",
  },
  {
    icon: Rocket,
    title: "Release & handoff",
    description:
      "Produk dirilis dengan dokumentasi, checklist, dan rekomendasi iterasi berikutnya.",
  },
];

const deliverables = [
  "Brief dan prioritas fitur",
  "Roadmap sprint",
  "Board progres bersama",
  "Dokumentasi handoff",
];

export function FeaturesSection() {
  return (
    <section className="editorial-surface">
      <div className="mx-auto max-w-screen-xxxl public-container-px py-14 sm:py-20">
        <FadeUp className="grid gap-5 border-b border-black/10 pb-6 lg:grid-cols-[0.75fr_1fr] lg:items-end">
          <div>
            <div className="editorial-kicker border-black/20 text-black/60">
              Cara kerja
            </div>
            <h2 className="editorial-display mt-4 max-w-3xl text-4xl text-balance sm:text-5xl lg:text-6xl">
              Anda selalu tahu apa yang sedang dikerjakan.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-black/60 sm:text-lg lg:justify-self-end">
            Dari obrolan pertama sampai handoff, setiap tahap punya output yang
            bisa dilihat dan dipakai untuk mengambil keputusan.
          </p>
        </FadeUp>

        <StaggerContainer className="grid gap-4 pt-6 md:grid-cols-2 xl:grid-cols-4">
          {processSteps.map((step, index) => (
            <StaggerItem key={step.title}>
              <div className="group relative h-full overflow-hidden rounded-xl border border-black/10 bg-white/78 p-5 shadow-[0_18px_55px_rgba(8,9,13,0.06)] transition-all duration-200 hover:-translate-y-1 hover:border-[#0b6bff]/25 hover:bg-white">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-[#0b6bff] text-white">
                    <step.icon className="size-5" />
                  </div>
                  <div className="text-xs font-black uppercase tracking-[0.14em] text-black/50">
                    0{index + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-black leading-tight text-black">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-black/60">
                  {step.description}
                </p>
                {index < processSteps.length - 1 && (
                  <ArrowRight className="absolute bottom-5 right-5 size-5 text-black/22 transition-transform group-hover:translate-x-1 group-hover:text-[#0b6bff]" />
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeUp delay={0.1} className="mt-5">
          <div className="grid gap-3 rounded-xl border border-black/10 bg-[#f5f8ff] p-4 sm:grid-cols-2 lg:grid-cols-4">
            {deliverables.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-semibold text-black/68">
                <CheckCircle2 className="size-4 shrink-0 text-[#0b6bff]" />
                {item}
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
