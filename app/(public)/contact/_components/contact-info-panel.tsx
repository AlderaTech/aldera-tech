import { Card } from "@/components/ui/card";
import type { ContactInfoItem } from "../_utils/contact-links";

export function ContactInfoPanel({
  contactInfo,
  operatingHours,
  responseTime,
}: {
  contactInfo: ContactInfoItem[];
  operatingHours: string;
  responseTime: string;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black">Info kontak lain</h2>
      <div className="space-y-3">
        {contactInfo.map((item) => {
          const content = (
            <div className="editorial-card flex items-start gap-3 rounded-xl p-4 transition-all hover:-translate-y-0.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#0b6bff] text-white">
                <item.icon className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-black/45">{item.label}</div>
                <div className="truncate text-sm font-medium">{item.value}</div>
              </div>
            </div>
          );
          return item.href ? (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="block"
            >
              {content}
            </a>
          ) : (
            <div key={item.label}>{content}</div>
          );
        })}
      </div>
      <Card className="gap-0 rounded-xl border-black bg-[#08090d] p-5 text-white">
        <h3 className="mb-1 text-sm font-semibold">Jam operasional</h3>
        <p className="text-xs leading-relaxed text-white/58">
          {operatingHours || "Hubungi kami untuk jadwal terbaru."}
          <br />
          Respon awal: {responseTime}
        </p>
      </Card>
    </div>
  );
}
