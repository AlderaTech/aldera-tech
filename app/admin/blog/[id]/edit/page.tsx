import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { BlogForm } from "../../_components/blog-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPage({ params }: PageProps) {
  const { id } = await params;

  const [post, categories] = await Promise.all([
    safeDb(
      async () =>
        await prisma.blogPost.findUnique({
          where: { id },
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            content: true,
            featuredImage: true,
            categoryId: true,
            published: true,
            scheduledAt: true,
          },
        }),
      null
    ),
    safeDb(
      async () =>
        await prisma.blogCategory.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true },
        }),
      [] as { id: string; name: string }[]
    ),
  ]);

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Post</h1>
        <p className="text-muted-foreground">Perbarui konten artikel ini.</p>
      </div>
      <BlogForm
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content,
          featuredImage: post.featuredImage ?? "",
          categoryId: post.categoryId ?? "",
          published: post.published,
          scheduledAt: post.scheduledAt
            ? new Date(
                post.scheduledAt.getTime() -
                  post.scheduledAt.getTimezoneOffset() * 60_000
              )
                .toISOString()
                .slice(0, 16)
            : "",
        }}
        categories={categories}
      />
    </div>
  );
}
