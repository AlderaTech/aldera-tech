import Image from "next/image";
import { CalendarDays, LockKeyhole, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/permissions";
import { formatDate, getInitials } from "@/lib/utils";
import type { ProfileUser } from "../_types/profile";
import styles from "./profile.module.css";

export function ProfileIdentity({ user }: { user: ProfileUser }) {
  return (
    <aside className={styles.identityColumn} aria-label="Identitas akun">
      <section
        className={styles.identityCard}
        aria-labelledby="profile-identity-heading"
      >
        <div className={styles.identityBanner} aria-hidden="true">
          <UserRound size={80} />
        </div>
        <div className={styles.identityBody}>
          <div className={styles.identityHeader}>
            <Avatar className={styles.avatar}>
              {user.avatar && (
                <AvatarImage
                  src={user.avatar}
                  alt={user.name}
                  className="object-cover"
                />
              )}
              <AvatarFallback className={styles.initials}>
                {getInitials(user.name || "U")}
              </AvatarFallback>
            </Avatar>
            <div className={styles.identityCopy}>
              <p className={styles.eyebrow}>Profil pengguna</p>
              <h2 id="profile-identity-heading">{user.name}</h2>
              <p className={styles.email}>{user.email}</p>
            </div>
          </div>
          {user.roles.length > 0 && (
            <div className={styles.roles} aria-label="Peran akun">
              {user.roles.map((role) => (
                <Badge variant="secondary" key={role}>
                  {ROLE_LABELS[role] ?? role}
                </Badge>
              ))}
            </div>
          )}
          {user.createdAt && (
            <div className={styles.joined}>
              <CalendarDays size={17} aria-hidden="true" />
              <div>
                <p>Bergabung sejak</p>
                <time dateTime={user.createdAt.toISOString()}>
                  {formatDate(user.createdAt)}
                </time>
              </div>
            </div>
          )}
          <p className={styles.readOnlyNote}>
            <LockKeyhole size={15} aria-hidden="true" />
            <span>
              Email akun ditampilkan sebagai informasi dan tidak dapat diedit di
              halaman ini.
            </span>
          </p>
        </div>
      </section>
      <div className={styles.helpPanel}>
        <div>
          <p>Tetap terhubung</p>
          <span>
            Gunakan nama yang mudah dikenali dan nomor kontak yang dapat
            dihubungi.
          </span>
        </div>
        <Image
          src="/images/dashboard/ai-relay/aldera-relay-assistant.webp"
          alt=""
          aria-hidden="true"
          width={72}
          height={82}
          sizes="72px"
          className={styles.helpMascot}
        />
      </div>
    </aside>
  );
}
