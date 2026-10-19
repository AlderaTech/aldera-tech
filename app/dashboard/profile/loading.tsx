import { ProfileFrame } from "./_components/profile-frame";
import { ProfileSkeleton } from "./_components/profile-skeleton";

export default function Loading() {
  return (
    <ProfileFrame>
      <ProfileSkeleton />
    </ProfileFrame>
  );
}
