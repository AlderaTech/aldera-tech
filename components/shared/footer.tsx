import Link from "next/link";
import { Github, Instagram, Linkedin } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { footerSections } from "@/lib/nav-config";
import { getSiteSettings, getSocialLinks } from "@/lib/public-settings";
import { PUBLIC_ROUTES } from "@/lib/routes";

const socialIcons = {
  GitHub: Github,
  LinkedIn: Linkedin,
  Instagram: Instagram,
};

export async function Footer() {
  const settings = await getSiteSettings();
  const socialLinks = getSocialLinks(settings);
  const year = new Date().getFullYear();
  const sections = footerSections.map((section) =>
    section.title !== "Kontak"
      ? section
      : {
          ...section,
          links: [
            { href: PUBLIC_ROUTES.contact, label: "Hubungi Kami" },
            ...(settings.email
              ? [{ href: `mailto:${settings.email}`, label: settings.email }]
              : []),
            ...(settings.whatsapp
              ? [{ href: toWhatsappHref(settings.whatsapp), label: "WhatsApp" }]
              : []),
          ],
        }
  );

  return (
    <footer className="editorial-ink">
      <div className="mx-auto w-full max-w-screen-xxxl public-container-px py-6">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
          <div className="grid gap-10 p-6 md:grid-cols-2 sm:p-8 lg:grid-cols-[1.55fr_repeat(3,1fr)] lg:p-10">
            <div className="space-y-5">
              <Logo size="md" variant="dark" />
              <p className="max-w-md text-sm leading-relaxed text-white/68">
                {settings.footerDescription}
              </p>
              <Link
                href={PUBLIC_ROUTES.contact}
                className="inline-flex rounded-lg bg-[#0b6bff] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#075bd8]"
              >
                Diskusi proyek
              </Link>
              {socialLinks.length > 0 && (
                <div className="flex gap-3 pt-2">
                  {socialLinks.map((link) => {
                    const Icon = socialIcons[link.label as keyof typeof socialIcons];
                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label}
                        className="inline-flex size-9 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <Icon className="size-4" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-3 text-sm font-semibold">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/68 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 px-6 py-5 sm:flex-row sm:px-8 lg:px-10">
            <p className="text-xs text-white/64">
              © {year} {settings.brandName}. All rights reserved.
            </p>
            <p className="text-xs text-white/64">Dibuat di Indonesia</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function toWhatsappHref(value: string) {
  if (value.startsWith("http")) return value;
  const digits = value.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : value;
}
