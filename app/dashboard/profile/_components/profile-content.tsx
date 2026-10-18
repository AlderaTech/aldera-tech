import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { ProfileIdentity } from "./profile-identity";
import { ProfileForm } from "./profile-form";
import { ProfileUnavailable } from "./profile-unavailable";
import styles from "./profile.module.css";

export async function ProfileContent({ userId }: { userId: string }) {
  const user = await safeDb(
    async () =>
      await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          roles: true,
          avatar: true,
          phone: true,
          createdAt: true,
        },
      }),
    null
  );

  if (!user) return <ProfileUnavailable />;

  return (
    <div className={styles.layout}>
      <ProfileIdentity user={user} />
      <ProfileForm
        defaultValues={{ name: user.name, phone: user.phone ?? "" }}
      />
    </div>
  );
}
