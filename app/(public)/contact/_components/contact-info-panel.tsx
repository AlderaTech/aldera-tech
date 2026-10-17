import { ArrowUpRight, Clock3 } from "lucide-react";
import type { ContactInfoItem } from "../_utils/contact-links";
import styles from "./contact.module.css";

export function ContactInfoPanel({
  contactInfo,
  socialLinks,
  operatingHours,
  responseTime,
}: {
  contactInfo: ContactInfoItem[];
  socialLinks: ContactInfoItem[];
  operatingHours: string;
  responseTime: string;
}) {
  return (
    <div id="kanal-kontak" className={styles.infoPanel}>
      <div className={styles.infoIntro}>
        <p className={styles.eyebrow}>
          <span aria-hidden="true" /> Pilih cara terhubung
        </p>
        <h2>Ada ide? Kami siap mendengar.</h2>
      </div>

      <div className={styles.contactList} aria-label="Saluran kontak">
        {contactInfo.map((item) => {
          const content = (
            <>
              <span className={styles.contactIcon} aria-hidden="true">
                <item.icon />
              </span>
              <span className={styles.contactCopy}>
                <small>{item.label}</small>
                <strong>{item.value}</strong>
              </span>
              {item.href && (
                <ArrowUpRight
                  className={styles.contactArrow}
                  aria-hidden="true"
                />
              )}
            </>
          );

          return item.href ? (
            <a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={
                item.href.startsWith("http") ? "noopener noreferrer" : undefined
              }
              className={styles.contactItem}
            >
              {content}
            </a>
          ) : (
            <div key={item.label} className={styles.contactItem}>
              {content}
            </div>
          );
        })}
      </div>

      <div className={styles.hoursCard}>
        <span className={styles.hoursIcon} aria-hidden="true">
          <Clock3 />
        </span>
        <div>
          <h3>Jam operasional</h3>
          <p>{operatingHours || "Hubungi kami untuk jadwal terbaru."}</p>
          <small>Respon awal: {responseTime}</small>
        </div>
      </div>

      {socialLinks.length > 0 && (
        <div className={styles.socials}>
          <span>Temukan kami juga di</span>
          <div>
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                title={item.label}
              >
                <item.icon aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
