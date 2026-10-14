import {
  CheckCircle2,
  Clock,
  Code2,
  Layers,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";

type ChallengeCard = {
  icon: LucideIcon;
  title: string;
  badge: string;
  items: string[];
};

const challengeCards: ChallengeCard[] = [
  {
    icon: Clock,
    title: "Siklus Rilis & Waktu",
    badge: "Kecepatan Eksekusi",
    items: [
      "Sprint terencana & deliverable jelas",
      "Estimasi milestone tepat waktu",
      "Tanpa bottleneck komunikasi",
    ],
  },
  {
    icon: Layers,
    title: "Arsitektur & Skalabilitas",
    badge: "Fondasi Sistem",
    items: [
      "Clean architecture modular",
      "Performa Core Web Vitals optimal",
      "Siap menangani jutaan request",
    ],
  },
  {
    icon: Code2,
    title: "Transparansi Biaya & Scope",
    badge: "Kepastian Investasi",
    items: [
      "Rincian scope transparan tanpa hidden fee",
      "Pelacakan jam kerja & commit real-time",
      "Revisi terstruktur & terkelola",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Kualitas Kode & Standar",
    badge: "Jaminan Mutu",
    items: [
      "100% Type-safe TypeScript & Next.js 16",
      "Audit keamanan & validasi Zod ketat",
      "Dokumentasi handoff menyeluruh",
    ],
  },
];

const deliverables = [
  "Brief & Prioritas Fitur Jelas",
  "Roadmap Sprint Mingguan",
  "Dashboard Progres Real-Time",
  "Dokumentasi & Handoff Rapi",
];

export function FeaturesSection() {
  return (
    <section className="border-y border-slate-100 bg-white py-16 sm:py-24">
      <div className="public-container-px mx-auto max-w-screen-xxxl">
        {/* Section Header with Reference Styling */}
        <FadeUp className="mx-auto mb-14 max-w-3xl text-center">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#00B1E1]" />
          <h2 className="font-serif text-3xl font-extrabold tracking-tight text-[#0F263A] sm:text-4xl lg:text-5xl">
            Tantangan & Solusi Rekayasa Digital
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Apakah bisnis Anda ingin mempercepat rilis tanpa mengorbankan
            kualitas arsitektur dan stabilitas jangka panjang?
          </p>
        </FadeUp>

        {/* Challenge Cards Grid */}
        <StaggerContainer className="grid gap-6 md:grid-cols-2">
          {challengeCards.map((card) => (
            <StaggerItem key={card.title}>
              <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-[#F8FAFC] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00B1E1]/40 hover:bg-white hover:shadow-xl sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left: Badge & Title */}
                  <div className="flex items-start gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#00B1E1] shadow-sm transition-transform group-hover:scale-105">
                      <card.icon className="size-6" />
                    </div>
                    <div>
                      <div className="text-xs font-bold tracking-wider text-[#00B1E1] uppercase">
                        {card.badge}
                      </div>
                      <h3 className="mt-1 font-serif text-xl font-bold text-[#0F263A] sm:text-2xl">
                        {card.title}
                      </h3>
                    </div>
                  </div>

                  {/* Right: Checklist Items */}
                  <ul className="space-y-2.5 sm:max-w-xs">
                    {card.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2.5 text-sm font-medium text-slate-700"
                      >
                        <CheckCircle2 className="size-4 shrink-0 text-[#00B1E1]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Deliverables Banner */}
        <FadeUp delay={0.15} className="mt-8">
          <div className="grid gap-4 rounded-2xl border border-slate-200/90 bg-[#F8FAFC] p-5 sm:grid-cols-2 lg:grid-cols-4">
            {deliverables.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm font-semibold text-[#0F263A]"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#00B1E1]/15 text-[#00B1E1]">
                  <CheckCircle2 className="size-4" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
