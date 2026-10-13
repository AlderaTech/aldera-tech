import {
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  type LucideIcon,
} from "lucide-react";
import type { PublicSiteSettings } from "@/lib/public-settings";

export type ContactInfoItem = {
  icon: LucideIcon;
  label: string;
  value: string;
  href: string | null;
};

export function getContactInfo(
  settings: PublicSiteSettings
): ContactInfoItem[] {
  return [
    settings.email
      ? {
          icon: Mail,
          label: "Email",
          value: settings.email,
          href: `mailto:${settings.email}`,
        }
      : null,
    settings.whatsapp
      ? {
          icon: MessageCircle,
          label: "WhatsApp",
          value: settings.whatsapp,
          href: toWhatsappHref(settings.whatsapp),
        }
      : null,
    settings.phone
      ? {
          icon: Phone,
          label: "Telepon",
          value: settings.phone,
          href: `tel:${settings.phone.replace(/\s/g, "")}`,
        }
      : null,
    settings.address
      ? {
          icon: MapPin,
          label: "Lokasi",
          value: settings.address,
          href: settings.mapsUrl || null,
        }
      : null,
  ].filter(Boolean) as ContactInfoItem[];
}

export function toWhatsappHref(value: string) {
  if (value.startsWith("http")) return value;
  const digits = value.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : value;
}
