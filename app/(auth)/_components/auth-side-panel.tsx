import Image from "next/image";
import { CheckCircle2, Layers3, ShieldCheck } from "lucide-react";
import { authPanelCopy, type AuthVariant } from "../_constants/auth-panel-copy";

type AuthSidePanelProps = {
  variant: AuthVariant;
};

export function AuthSidePanel({ variant }: AuthSidePanelProps) {
  const copy = authPanelCopy[variant];

  return (
    <aside className="relative hidden h-full overflow-hidden bg-[#0F263A] p-6 text-white lg:flex lg:flex-col lg:justify-between">
      {/* Background Cloud Engineering Telemetry Visual */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/auth/auth-engineering-backdrop.webp"
          alt="Cloud Architecture & Software Engineering Topology"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover opacity-60 mix-blend-luminosity transition-opacity duration-700 hover:opacity-75"
          priority
        />
        {/* Deep Navy Gradient Overlays and Organic Wave Mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F263A] via-[#0F263A]/70 to-[#0F263A]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,177,225,0.22),transparent_60%)]" />
      </div>

      {/* Header Info */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#00B1E1]/30 bg-[#0F263A]/80 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-[#00B1E1] backdrop-blur-md">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00B1E1] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[#00B1E1]" />
          </span>
          {copy.status}
        </div>
        <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {copy.title}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">
          {copy.description}
        </p>
      </div>

      {/* Feature Bullets & Architecture Metrics */}
      <div className="relative z-10 mt-8 space-y-4">
        <div className="space-y-2.5">
          {copy.bullets.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3 text-xs font-medium text-slate-200 backdrop-blur-sm"
            >
              <CheckCircle2 className="size-4 shrink-0 text-[#00B1E1]" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-2xl border border-[#00B1E1]/20 bg-[#0F263A]/90 p-4 shadow-lg backdrop-blur-md">
            <Layers3 className="mb-2 size-5 text-[#00B1E1]" />
            <div className="text-2xl font-black tracking-tight text-white">
              99.9%
            </div>
            <div className="mt-0.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Uptime SLA
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-lg backdrop-blur-md">
            <ShieldCheck className="mb-2 size-5 text-[#00B1E1]" />
            <div className="text-2xl font-black tracking-tight text-white">
              1x24h
            </div>
            <div className="mt-0.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Respon Cepat
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
