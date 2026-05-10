import Image from "next/image";
import { CheckCircle2, Layers3, ShieldCheck } from "lucide-react";
import { authPanelCopy, type AuthVariant } from "../_constants/auth-panel-copy";

type AuthSidePanelProps = {
  variant: AuthVariant;
};

export function AuthSidePanel({ variant }: AuthSidePanelProps) {
  const copy = authPanelCopy[variant];

  return (
    <aside className="relative hidden h-full overflow-hidden bg-[#08090d] p-4 text-white lg:block">
      <Image
        src="/generated/solvo-tech/hero-blue-editorial-v2.png"
        alt="Workspace dashboard digital Solvo Tech"
        fill
        sizes="(min-width: 1024px) 52vw, 100vw"
        className="object-cover opacity-72"
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,9,13,0.96)_0%,rgba(8,9,13,0.74)_42%,rgba(8,9,13,0.35)_100%)]" />
      <div className="relative z-10 flex h-full flex-col justify-between rounded-lg border border-white/12 bg-[#08090d]/48 p-5 backdrop-blur-md">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white/64">
            <span className="size-2 rounded-full bg-[#0b6bff]" />
            {copy.status}
          </div>
          <h2 className="editorial-display mt-7 max-w-xl text-4xl text-balance">
            {copy.title}
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/64">
            {copy.description}
          </p>
        </div>

        <div className="grid gap-3">
          {copy.bullets.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.07] p-3 text-sm font-semibold text-white/78"
            >
              <CheckCircle2 className="size-4 shrink-0 text-[#0b6bff]" />
              {item}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-lg bg-[#0b6bff] p-4">
              <Layers3 className="mb-4 size-5" />
              <div className="text-2xl font-black">1</div>
              <div className="mt-1 text-xs font-semibold uppercase text-white/70">
                Papan kerja
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.07] p-4">
              <ShieldCheck className="mb-4 size-5 text-[#0b6bff]" />
              <div className="text-2xl font-black">24/7</div>
              <div className="mt-1 text-xs font-semibold uppercase text-white/55">
                Akses aman
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
