import Image from "next/image";
import { cn } from "@/lib/utils";
import connect from "@/public/images/ai-relay/aldera-cat-relay-balance.webp";
import coding from "@/public/images/about/technology/web.webp";
import assistant from "@/public/images/about/technology/design.webp";
import styles from "./relay-workspace.module.css";

/** Ilustrasi maskot 3D & aksen teknologi pada workspace AI Relay. */
const MASCOTS = { connect, coding, assistant };

export function RelayMascot({
  pose,
  className,
}: {
  pose: keyof typeof MASCOTS;
  className?: string;
}) {
  return (
    <span className={cn(styles.mascot, className)} aria-hidden="true">
      <Image
        src={MASCOTS[pose]}
        alt=""
        fill
        sizes="(max-width: 639px) 88px, 120px"
        className="object-contain"
      />
    </span>
  );
}
