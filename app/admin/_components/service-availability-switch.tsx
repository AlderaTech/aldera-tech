"use client";

import { useId, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Network, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateServiceAvailability } from "@/lib/actions/service-availability";
import type { RelayService } from "@/lib/service-availability";

const SERVICES = {
  ai_router: {
    name: "Akses API & Playground",
    icon: Network,
    description:
      "Saat dijeda, pelanggan tetap bisa membuka katalog, mengelola saldo, dan melihat riwayat.",
  },
  telegram_bot: {
    name: "Layanan Telegram",
    icon: Send,
    description:
      "Saat dijeda, bot mengarahkan pelanggan ke dashboard. Pemberitahuan hasil top-up tetap dikirim.",
  },
};

export function ServiceAvailabilitySwitch({
  service,
  enabled,
}: {
  service: RelayService;
  enabled: boolean | null;
}) {
  const id = useId();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { name, icon: Icon, description } = SERVICES[service];

  function changeAvailability(nextEnabled: boolean) {
    startTransition(async () => {
      try {
        const saved = await updateServiceAvailability(service, nextEnabled);
        toast.success(
          saved.enabled ? `${name} aktif kembali.` : `${name} dijeda.`
        );
      } catch {
        toast.error(`Status ${name} belum tersimpan. Coba lagi.`);
        router.refresh();
      }
    });
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <h2 id={id} className="font-semibold">
            {name}
          </h2>
          <p id={`${id}-description`} className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {enabled === null ? (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          Status belum bisa dimuat.
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => startTransition(() => router.refresh())}
            disabled={pending}
          >
            Coba lagi
          </Button>
        </div>
      ) : (
        <div className="flex shrink-0 items-center gap-3">
          <Badge variant={enabled ? "default" : "secondary"} role="status">
            {pending ? "Menyimpan…" : enabled ? "Aktif" : "Dijeda"}
          </Badge>
          <Switch
            aria-labelledby={id}
            aria-describedby={`${id}-description`}
            checked={enabled}
            disabled={pending}
            onCheckedChange={changeAvailability}
          />
        </div>
      )}
    </section>
  );
}
