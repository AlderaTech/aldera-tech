import Link from "next/link";
import {
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Facebook,
  ArrowUpRight,
  CodeXml,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { footerSections } from "@/lib/nav-config";
import { defaultSiteSettings, SITE_SETTING_ID } from "@/lib/public-settings";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { cn } from "@/lib/utils";
import styles from "./studio-footer.module.css";

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

export async function Footer() {
  const settings = await safeDb(async () => {
    return await prisma.siteSetting.findUnique({
      where: { id: SITE_SETTING_ID },
    });
  }, null);

  const brandName = settings?.brandName || defaultSiteSettings.brandName;
  const footerDescription =
    settings?.footerDescription || defaultSiteSettings.footerDescription;
  const email = settings?.email?.trim();
  const whatsapp = settings?.whatsapp?.trim();

  type SocialPlatformConfig = {
    label: string;
    href: string | null | undefined;
    icon: React.ComponentType<{ className?: string }>;
  };

  type ActiveSocialLink = {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  };

  // All 8 social media platforms: Twitter/X, GitHub, LinkedIn, Instagram, YouTube, TikTok, Facebook, Discord
  const allPlatforms: SocialPlatformConfig[] = [
    { label: "Twitter", href: settings?.twitterUrl, icon: Twitter },
    { label: "GitHub", href: settings?.githubUrl, icon: Github },
    { label: "LinkedIn", href: settings?.linkedinUrl, icon: Linkedin },
    { label: "Instagram", href: settings?.instagramUrl, icon: Instagram },
    { label: "YouTube", href: settings?.youtubeUrl, icon: Youtube },
    { label: "TikTok", href: settings?.tiktokUrl, icon: TikTokIcon },
    { label: "Facebook", href: settings?.facebookUrl, icon: Facebook },
    { label: "Discord", href: settings?.discordUrl, icon: DiscordIcon },
  ];

  // Strictly filter out platforms where the URL is null, undefined, or empty string
  const socialLinks: ActiveSocialLink[] = allPlatforms
    .filter(
      (item): item is SocialPlatformConfig & { href: string } =>
        typeof item.href === "string" && item.href.trim().length > 0
    )
    .map((item) => ({
      label: item.label,
      href: item.href.trim(),
      icon: item.icon,
    }));

  const year = new Date().getFullYear();
  const sections = footerSections.map((section) =>
    section.title !== "Kontak"
      ? section
      : {
          ...section,
          links: [
            { href: PUBLIC_ROUTES.contact, label: "Hubungi Kami" },
            ...(email ? [{ href: `mailto:${email}`, label: email }] : []),
            ...(whatsapp
              ? [{ href: toWhatsappHref(whatsapp), label: "WhatsApp" }]
              : []),
          ],
        }
  );

  return (
    <footer className={cn("editorial-ink", styles.footer)}>
      <div
        className={cn(
          "public-container-px mx-auto w-full max-w-screen-xxxl py-6",
          styles.container
        )}
      >
        <div
          className={cn(
            "overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]",
            styles.panel
          )}
        >
          <div className={styles.intro}>
            <p>
              <CodeXml className="size-4" aria-hidden="true" /> Software
              Engineering & Digital Studio
            </p>
            <span>Mari bangun langkah berikutnya.</span>
          </div>
          <div
            className={cn(
              "grid gap-10 p-6 sm:p-8 md:grid-cols-2 lg:grid-cols-[1.55fr_repeat(3,1fr)] lg:p-10",
              styles.grid
            )}
          >
            <div className={cn("space-y-5", styles.brand)}>
              <Logo size="md" variant="dark" className={styles.brandLogo} />
              <p className="max-w-md text-sm leading-relaxed text-white/68">
                {footerDescription}
              </p>
              <Link
                href={PUBLIC_ROUTES.contact}
                className={cn(
                  "inline-flex cursor-pointer rounded-lg bg-brand-cyan px-4 py-2 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-cyan-hover",
                  styles.consultation
                )}
              >
                Konsultasi Gratis
                <span className={styles.ctaIcon} aria-hidden="true">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
            </div>
            {sections.map((section, index) => (
              <div
                key={section.title}
                className={cn(
                  styles.linkGroup,
                  section.title === "Kontak" && styles.contactGroup
                )}
              >
                <div className={styles.groupHeading}>
                  <span className={styles.sectionIndex} aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mb-3 text-sm font-semibold">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="cursor-pointer text-sm text-white/68 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {socialLinks.length > 0 && (
            <div className={styles.socials}>
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          )}
          <div className={styles.wordmark} aria-hidden="true">
            {brandName}
          </div>
          <div
            className={cn(
              "flex flex-col items-center justify-between gap-4 border-t border-white/10 px-6 py-5 sm:flex-row sm:px-8 lg:px-10",
              styles.bottom
            )}
          >
            <p className="text-xs text-white/64">
              © {year} {brandName}. All rights reserved.
            </p>
            <p className="text-xs text-white/64">Dibuat di Indonesia</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function toWhatsappHref(value: string) {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  const digits = value.replace(/\D/g, "");
  if (!digits) return value;

  let normalized = digits;
  if (digits.startsWith("0")) {
    normalized = "62" + digits.slice(1);
  } else if (!digits.startsWith("62")) {
    normalized = "62" + digits;
  }

  return `https://wa.me/${normalized}`;
}
