import { auth } from "@/auth";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <>
      <Navbar session={session} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
