import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/lib/services-data";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { getServiceArtwork } from "@/lib/service-artwork";
import styles from "./services-preview.module.css";

type ServicePreviewCardProps = {
  service: Pick<Service, "slug" | "title" | "summary" | "icon">;
  index: number;
};

export function ServicePreviewCard({
  service,
  index,
}: ServicePreviewCardProps) {
  const artwork = getServiceArtwork(service.slug);
  const Icon = service.icon;
  const artworkSize =
    index === 0 || index === 5
      ? "280px"
      : index === 1 || index === 4
        ? "250px"
        : "220px";

  return (
    <Link
      href={PUBLIC_ROUTES.contactWithService(service.slug)}
      className={styles.card}
    >
      <div className={styles.cardVisual} aria-hidden="true">
        <span className={styles.index}>
          {String(index + 1).padStart(2, "0")}
        </span>
        {artwork ? (
          <div className={styles.artwork}>
            <Image
              src={artwork}
              alt=""
              fill
              sizes={`(min-width: 1280px) ${artworkSize}, (min-width: 1024px) 260px, (min-width: 640px) 250px, 280px`}
              quality={90}
              className={styles.image}
            />
          </div>
        ) : (
          <div className={styles.fallbackArtwork}>
            <Icon strokeWidth={1} />
          </div>
        )}
        <span className={styles.openIcon}>
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardHeading}>
          <Icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
          <h3>{service.title}</h3>
        </div>
        <p>{service.summary}</p>
      </div>
    </Link>
  );
}
