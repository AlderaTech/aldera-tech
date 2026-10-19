import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AUTH_ROUTES } from "@/lib/routes";
import { ProfileContent } from "./_components/profile-content";
import { ProfileFrame } from "./_components/profile-frame";
import { ProfileSkeleton } from "./_components/profile-skeleton";

export const metadata: Metadata = {
  title: "Profil Saya",
  description: "Kelola informasi profil dan kontak akun Aldera Tech Anda.",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect(AUTH_ROUTES.login);
  return (
    <ProfileFrame>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent userId={session.user.id} />
      </Suspense>
    </ProfileFrame>
  );
}
