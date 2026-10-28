import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/permissions";
import { formatDate, getInitials } from "@/lib/utils";
import type { ProfileUser } from "../_types/profile";
import { ProfileMascot } from "./profile-mascot";
import styles from "./profile.module.css";

export function ProfileIdentity({
  user,
  editAction,
}: {
  user: ProfileUser;
  editAction?: ReactNode;
}) {
  return (
    <section
      className={styles.identityCard}
      aria-labelledby="profile-identity-heading"
    >
      <div className={styles.identityMain}>
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
          <p className={styles.eyebrow}>Akun Aldera Tech</p>
          <div className={styles.identityName}>
            <h2 id="profile-identity-heading">{user.name}</h2>
            {user.roles.length > 0 && (
              <div className={styles.roles} aria-label="Peran akun">
                {user.roles.map((role) => (
                  <Badge variant="secondary" key={role}>
                    {ROLE_LABELS[role] ?? role}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <dl className={styles.identityDetails}>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Telepon / WhatsApp</dt>
              <dd>{user.phone || "Belum ditambahkan"}</dd>
            </div>
            {user.createdAt && (
              <div>
                <dt>Bergabung sejak</dt>
                <dd>
                  <time dateTime={user.createdAt.toISOString()}>
                    {formatDate(user.createdAt)}
                  </time>
                </dd>
              </div>
            )}
          </dl>
          <p className={styles.readOnlyNote}>
            <LockKeyhole size={13} aria-hidden="true" />
            Email akun tidak dapat diedit di halaman ini.
          </p>
        </div>
      </div>
      {editAction && (
        <div className={styles.identityActions}>
          <ProfileMascot variant="guide" className={styles.identityMascot} />
          {editAction}
        </div>
      )}
    </section>
  );
}
