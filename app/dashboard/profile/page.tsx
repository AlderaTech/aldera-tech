import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { formatDate, getInitials } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await safeDb(
    async () =>
      await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          company: true,
          phone: true,
          createdAt: true,
        },
      }),
    null
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">
          Informasi akun Anda di Solvo Tech.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <Avatar className="size-16">
            {user?.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {getInitials(user?.name ?? session.user.name ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle>{user?.name ?? session.user.name}</CardTitle>
            <CardDescription>{user?.email ?? session.user.email}</CardDescription>
            <Badge variant={user?.role === "ADMIN" ? "default" : "secondary"}>
              {user?.role ?? session.user.role}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="text-muted-foreground">Perusahaan</span>
            <span>{user?.company ?? "Tidak tersedia"}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="text-muted-foreground">Telepon</span>
            <span>{user?.phone ?? "Tidak tersedia"}</span>
          </div>
          {user?.createdAt && (
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-muted-foreground">Bergabung</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ubah profil</CardTitle>
          <CardDescription>
            Fitur edit profil akan hadir segera. Untuk sementara, hubungi
            admin untuk memperbarui informasi akun Anda.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
