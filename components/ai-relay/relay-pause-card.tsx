import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Network, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DASHBOARD_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import connect from "@/public/images/ai-relay/aldera-cat-relay-connect.webp";
import peek from "@/public/images/ai-relay/aldera-cat-relay-peek.webp";

const CONTENT = {
  public: {
    title: "Akses AI sedang dijeda",
    description:
      "Sambil menunggu, Anda bisa menjelajahi katalog model dan memperkirakan biaya pemakaian. Pengaturan akun tetap tersedia di portal.",
    actions: [
      { label: "Lihat katalog model", href: "#catalog-section" },
      { label: "Buka portal", href: DASHBOARD_ROUTES.aiRelay },
    ],
  },
  playground: {
    title: "Akses AI sedang dijeda",
    description:
      "Permintaan API dan sesi Playground baru akan tersedia kembali setelah jeda. Sementara itu, Anda bisa membandingkan model dan tarifnya.",
    actions: [
      {
        label: "Lihat katalog model",
        href: DASHBOARD_ROUTES.aiRelayTab("catalog"),
      },
    ],
  },
  telegram: {
    title: "Lanjutkan lewat dashboard",
    description:
      "Untuk sementara, layanan Telegram beralih ke web. Jika akun Anda sudah terhubung, Anda bisa cek saldo dan mengisi ulang dari dashboard. Tim Aldera siap membantu jika akun belum terhubung atau transfer sedang berjalan.",
    actions: [
      {
        label: "Buka saldo & top-up",
        href: DASHBOARD_ROUTES.aiRelayTab("billing"),
      },
      { label: "Hubungi tim Aldera", href: PUBLIC_ROUTES.contact },
    ],
  },
};

export function RelayPauseCard({ view }: { view: keyof typeof CONTENT }) {
  const { title, description, actions } = CONTENT[view];
  const Heading = view === "public" ? "h1" : "h3";
  const Icon = view === "telegram" ? Send : Network;

  return (
    <section className="relative isolate grid items-center gap-6 overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card px-6 py-8 text-card-foreground sm:grid-cols-[1fr_auto] sm:px-9 sm:py-10">
      <div>
        <span className="mb-4 inline-flex rounded-xl border border-primary/15 bg-card p-2.5 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div role="status">
          <Heading className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {title}
          </Heading>
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {actions.map(({ label, href }, index) => (
            <Button
              key={href}
              asChild
              variant={index === 0 ? "default" : "outline"}
            >
              <Link href={href}>
                {label}
                {index === 0 && (
                  <ArrowRight className="size-4" aria-hidden="true" />
                )}
              </Link>
            </Button>
          ))}
        </div>
      </div>
      <Image
        src={view === "telegram" ? connect : peek}
        alt=""
        sizes="(max-width: 639px) 104px, (max-width: 1023px) 160px, 208px"
        className="order-first mx-auto h-auto w-26 drop-shadow-sm sm:order-last sm:w-40 lg:w-52"
      />
    </section>
  );
}
