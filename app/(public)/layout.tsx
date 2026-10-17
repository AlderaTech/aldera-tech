import { auth } from "@/auth";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { PublicShell } from "./_components/public-shell";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <PublicShell navbar={<Navbar session={session} />} footer={<Footer />}>
      {children}
    </PublicShell>
  );
}
