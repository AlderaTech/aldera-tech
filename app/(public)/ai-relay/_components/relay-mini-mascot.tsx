import Image from "next/image";
import { cn } from "@/lib/utils";
import peek from "@/public/images/ai-relay/aldera-cat-relay-peek.webp";
import connect from "@/public/images/ai-relay/aldera-cat-relay-connect.webp";
import styles from "./relay.module.css";

export function RelayMiniMascot({
  pose,
  className,
}: {
  pose: "peek" | "connect";
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={cn(styles.miniMascot, className)}>
      <Image
        src={pose === "peek" ? peek : connect}
        alt=""
        sizes={pose === "peek" ? "104px" : "84px"}
        quality={90}
      />
    </span>
  );
}
