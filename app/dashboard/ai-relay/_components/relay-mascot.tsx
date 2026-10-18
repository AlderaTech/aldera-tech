import Image from "next/image";
import { cn } from "@/lib/utils";
import connect from "@/public/images/dashboard/ai-relay/aldera-relay-connect.webp";
import coding from "@/public/images/dashboard/ai-relay/aldera-relay-coding.webp";
import assistant from "@/public/images/dashboard/ai-relay/aldera-relay-assistant.webp";
import styles from "./relay-workspace.module.css";

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
        sizes="(max-width: 639px) 80px, 120px"
        quality={90}
        className="object-contain"
      />
    </span>
  );
}
