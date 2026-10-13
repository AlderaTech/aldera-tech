import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROUTES } from "@/lib/routes";
import { safeDb } from "@/lib/safe-db";
import { CategoryManagement } from "./_components/category-management";

export default async function AdminBlogCategoriesPage() {
  const session = await auth();
  if (!hasPermission(session?.user.role, PERMISSIONS.BLOG_VIEW)) {
    redirect(ADMIN_ROUTES.home);
  }
  const permissions = {
    canCreate: hasPermission(session?.user.role, PERMISSIONS.BLOG_CREATE),
    canEdit: hasPermission(session?.user.role, PERMISSIONS.BLOG_EDIT),
    canDelete: hasPermission(session?.user.role, PERMISSIONS.BLOG_DELETE),
  };

  const categories = await safeDb(
    async () =>
      await prisma.blogCategory.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: { select: { posts: true } },
        },
      }),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2">
            <Button asChild variant="ghost" size="sm" className="-ml-3">
              <Link href={ADMIN_ROUTES.blog}>
                <ArrowLeft className="size-4" /> Kembali ke Blog
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Kategori Blog</h1>
          <p className="text-muted-foreground">
            Kelola kategori untuk filter, navigasi, dan pengelompokan artikel.
          </p>
        </div>
      </div>

      <CategoryManagement categories={categories} permissions={permissions} />
    </div>
  );
}
