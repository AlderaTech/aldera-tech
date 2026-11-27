import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { getInitials } from "@/lib/utils";
import mascotGreeting from "@/public/images/dashboard/aldera-cat-greeting.webp";
import styles from "./overview.module.css";
import { WorkspaceBanner } from "@/components/dashboard/workspace-banner";

export function OverviewWelcome({ user }: { user: Session["user"] }) {
  return (
    <WorkspaceBanner
      className={styles.welcome}
      aria-labelledby="overview-heading"
      eyebrow="Ruang kerja Anda"
      mascot={
        <Image
          src={mascotGreeting}
          alt=""
          aria-hidden="true"
          width={160}
          height={160}
          sizes="(min-width: 1024px) 144px, (min-width: 640px) 120px, 0px"
          priority
        />
      }
    >
      <div className={styles.welcomeIdentity}>
        <Avatar className={styles.avatar}>
          {user.image && (
            <AvatarImage src={user.image} alt={user.name ?? "User"} />
          )}
          <AvatarFallback>{getInitials(user.name ?? "User")}</AvatarFallback>
        </Avatar>
        <div className={styles.welcomeCopy}>
          <h1 id="overview-heading">
            Halo, {user.name?.split(" ")[0] ?? "User"}
          </h1>
          <p className={styles.description}>
            Berikut ringkasan aktivitas proyek Anda.
          </p>
          <div className={styles.profileLine}>
            {user.email && <span>{user.email}</span>}
            <Link href={DASHBOARD_ROUTES.profile}>
              Profil Anda <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </WorkspaceBanner>
  );
}
