import Link from "next/link";
import { Plus, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROUTES } from "@/lib/routes";
import { safeDb } from "@/lib/safe-db";
import { BlogTable } from "./_components/blog-table";

export default async function AdminBlogPage() {
  const posts = await safeDb(
    async () =>
      await prisma.blogPost.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          title: true,
          published: true,
          publishedAt: true,
          createdAt: true,
          category: { select: { name: true } },
          author: { select: { name: true } },
        },
      }),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">
            Kelola semua artikel blog Anda.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href={ADMIN_ROUTES.blogCategories}>
              <Tags className="size-4" /> Kategori
            </Link>
          </Button>
          <Button asChild>
            <Link href={ADMIN_ROUTES.blogNew}>
              <Plus className="size-4" /> Post Baru
            </Link>
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <BlogTable posts={posts} />
      </Card>
    </div>
  );
}
