import { Suspense } from "react";
import { FadeUp } from "@/components/shared/motion";
import type { PublicSiteSettings } from "@/lib/public-settings";
import { ContactForm } from "./contact-form";
import { ContactInfoPanel } from "./contact-info-panel";
import { getContactInfo, getContactSocialLinks } from "../_utils/contact-links";
import shared from "../../_components/studio.module.css";
import styles from "./contact.module.css";

export function ContactSection({ settings }: { settings: PublicSiteSettings }) {
  const contactInfo = getContactInfo(settings);
  const socialLinks = getContactSocialLinks(settings);

  return (
    <section className={styles.section} aria-label="Hubungi Aldera Tech">
      <div className={shared.container}>
        <div className={styles.mainGrid}>
          <FadeUp className={styles.infoColumn}>
            <ContactInfoPanel
              contactInfo={contactInfo}
              socialLinks={socialLinks}
              operatingHours={settings.operatingHours}
              responseTime={settings.responseTime}
            />
          </FadeUp>
          <FadeUp delay={0.08} className={styles.formColumn}>
            <div id="formulir-kontak" className={styles.formCard}>
              <div className={styles.formHeading}>
                <p className={styles.eyebrow}>
                  <span aria-hidden="true" /> Mulai percakapan
                </p>
                <h2>Kirim pesan</h2>
                <p>
                  Beri tahu kami apa yang ingin Anda bangun. Tim kami akan
                  menghubungi Anda dalam {settings.responseTime}.
                </p>
              </div>
              <Suspense>
                <ContactForm responseTime={settings.responseTime} />
              </Suspense>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
