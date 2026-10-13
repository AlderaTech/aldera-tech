import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { FadeUp } from "@/components/shared/motion";
import type { PublicSiteSettings } from "@/lib/public-settings";
import { ContactForm } from "./contact-form";
import { ContactInfoPanel } from "./contact-info-panel";
import { getContactInfo } from "../_utils/contact-links";

export function ContactSection({ settings }: { settings: PublicSiteSettings }) {
  const contactInfo = getContactInfo(settings);

  return (
    <section className="editorial-surface">
      <div className="public-container-px mx-auto max-w-screen-xxxl py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <FadeUp>
            <Card className="editorial-card gap-0 rounded-xl p-6 shadow-lg sm:p-8">
              <h2 className="editorial-display mb-2 text-4xl">Kirim pesan</h2>
              <p className="mb-6 text-sm text-black/60">
                Form ini tersimpan aman. Tim kami akan menghubungi Anda dalam{" "}
                {settings.responseTime}.
              </p>
              <Suspense>
                <ContactForm />
              </Suspense>
            </Card>
          </FadeUp>
          <FadeUp delay={0.1}>
            <ContactInfoPanel
              contactInfo={contactInfo}
              operatingHours={settings.operatingHours}
              responseTime={settings.responseTime}
            />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
