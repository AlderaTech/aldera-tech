import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { BlogForm } from "../_components/blog-form";

export default async function NewBlogPage() {
  const categories = await safeDb(
    async () =>
      await prisma.blogCategory.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
    [] as { id: string; name: string }[]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Post Baru</h1>
        <p className="text-muted-foreground">
          Tulis dan publish artikel baru.
        </p>
      </div>
      <BlogForm categories={categories} />
    </div>
  );
}
