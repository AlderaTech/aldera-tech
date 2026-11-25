import Link from "next/link";
import { ArrowDown, CalendarDays, Clock3, MessageCircle } from "lucide-react";
import { PUBLIC_ROUTES } from "@/lib/routes";
import mascot from "@/public/images/contact/aldera-cat-contact.webp";
import { StudioIllustratedHero } from "../../_components/studio-illustrated-hero";
import heroStyles from "../../_components/studio-illustrated-hero.module.css";
import shared from "../../_components/studio.module.css";
import { toWhatsappHref } from "../_utils/contact-links";

export function ContactHero({
  responseTime,
  operatingHours,
  whatsapp,
}: {
  responseTime: string;
  operatingHours?: string;
  whatsapp?: string;
}) {
  return (
    <StudioIllustratedHero
      headingId="contact-heading"
      label="Kontak / Aldera Tech"
      title={
        <>
          Mari bicara tentang <span>proyek Anda.</span>
        </>
      }
      description="Ceritakan kebutuhan digital Anda. Konsultasi 30 menit pertama gratis."
      illustration={mascot}
      panelTitle="Waktu layanan"
      panel={
        <>
          <dl className={heroStyles.panelList}>
            <div>
              <dt>
                <Clock3 aria-hidden="true" /> Waktu respons
              </dt>
              <dd>{responseTime}</dd>
            </div>
            {operatingHours && (
              <div>
                <dt>
                  <CalendarDays aria-hidden="true" /> Jam operasional
                </dt>
                <dd>{operatingHours}</dd>
              </div>
            )}
          </dl>
          {whatsapp && (
            <a
              href={toWhatsappHref(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className={heroStyles.panelLink}
            >
              Chat WhatsApp <MessageCircle aria-hidden="true" />
            </a>
          )}
        </>
      }
    >
      <Link
        href={`${PUBLIC_ROUTES.contact}#formulir-kontak`}
        className={shared.blueButton}
      >
        Tulis Pesan
        <ArrowDown className="size-4" aria-hidden="true" />
      </Link>
      <a href="#kanal-kontak" className={shared.outlineLink}>
        Saluran Kontak
      </a>
    </StudioIllustratedHero>
  );
}
