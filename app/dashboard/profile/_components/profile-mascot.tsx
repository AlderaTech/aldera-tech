import Image from "next/image";
import { cn } from "@/lib/utils";
import styles from "./profile-mascot.module.css";

const portraits = {
  guide: {
    src: "/images/dashboard/profile/aldera-profile-guide.webp",
    sizes: "(min-width: 864px) 124px, 80px",
  },
  activity: {
    src: "/images/dashboard/profile/aldera-profile-activity.webp",
    sizes: "80px",
  },
} as const;

export function ProfileMascot({
  variant,
  className,
}: {
  variant: keyof typeof portraits;
  className?: string;
}) {
  const portrait = portraits[variant];
  return (
    <span
      className={cn(styles.mascot, className)}
      aria-hidden="true"
      data-profile-mascot={variant}
    >
      <Image
        src={portrait.src}
        alt=""
        width={256}
        height={288}
        sizes={portrait.sizes}
        className={styles.image}
      />
    </span>
  );
}
