import type { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { getInitials } from "@/lib/utils";
import mascot from "@/public/images/auth/aldera-cat-register.webp";
import styles from "./overview.module.css";

export function OverviewWelcome({ user }: { user: Session["user"] }) {
  return (
    <section className={styles.welcome} aria-labelledby="overview-heading">
      <div className={styles.welcomeIdentity}>
        <Avatar className={styles.avatar}>
          {user.image && (
            <AvatarImage src={user.image} alt={user.name ?? "User"} />
          )}
          <AvatarFallback>{getInitials(user.name ?? "User")}</AvatarFallback>
        </Avatar>
        <div className={styles.welcomeCopy}>
          <p className={styles.eyebrow}>Ruang kerja Anda</p>
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
      <Image
        src={mascot}
        alt=""
        aria-hidden="true"
        className={styles.mascot}
        width={80}
        height={96}
        sizes="(min-width: 640px) 80px, 1px"
        quality={90}
      />
    </section>
  );
}
