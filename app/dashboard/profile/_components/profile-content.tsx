import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { ProfileIdentity } from "./profile-identity";
import { ProfileEditor } from "./profile-editor";
import { ProfilePreviewWorkspace } from "./profile-preview-workspace";
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
    <div className={styles.workspace}>
      <ProfileIdentity
        user={user}
        editAction={
          <ProfileEditor
            defaultValues={{ name: user.name, phone: user.phone ?? "" }}
          />
        }
      />
      <ProfilePreviewWorkspace />
    </div>
  );
}
