import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
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
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="size-4" /> Post Baru
          </Link>
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <BlogTable posts={posts} />
      </Card>
    </div>
  );
}
