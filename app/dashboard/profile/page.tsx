import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { formatDate, getInitials } from "@/lib/utils";
import { ProfileForm } from "./_components/profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await safeDb(
    async () =>
      await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true, name: true, email: true, role: true,
          avatar: true, company: true, phone: true, createdAt: true,
        },
      }),
    null
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground">Kelola informasi akun Anda.</p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4">
          <Avatar className="size-16">
            {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {getInitials(user?.name ?? "U")}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle>{user?.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{user?.role}</Badge>
              {user?.createdAt && <span className="text-xs text-muted-foreground">Bergabung {formatDate(user.createdAt)}</span>}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            defaultValues={{ name: user?.name ?? "", phone: user?.phone ?? "", company: user?.company ?? "" }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
