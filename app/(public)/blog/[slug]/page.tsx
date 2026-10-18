import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveBlogPostImage } from "@/lib/public-fallbacks";
import { readingTime } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { ReadingProgressBar } from "./_components/reading-progress-bar";
import { BlogViewIncrementer } from "./_components/blog-view-incrementer";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/permissions";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { BlogArticleLayout } from "./_components/blog-article-layout";
import {
  getBlogDetailPost,
  getBlogStaticParams,
  getBlogEngagement,
} from "./_data/blog-detail";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogDetailPost(slug);
  if (!post) return { title: "Post tidak ditemukan" };
  const featuredImage = resolveBlogPostImage(post.slug, post.featuredImage);
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: PUBLIC_ROUTES.blogDetail(post.slug) },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: featuredImage ? [featuredImage] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.author?.name ? [post.author.name] : undefined,
    },
  };
}

export async function generateStaticParams() {
  return getBlogStaticParams();
}

export default async function BlogDetail({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogDetailPost(slug);
  if (!post) notFound();

  const minutes = readingTime(post.content);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const featuredImage = resolveBlogPostImage(post.slug, post.featuredImage);

  const session = await auth();
  const currentUserId = session?.user?.id;
  type UserWithRoles = {
    roles?: import("@prisma/client").Role[];
    role?: import("@prisma/client").Role;
  };
  const sessionUser = session?.user as unknown as UserWithRoles | undefined;
  const userRoles = sessionUser?.roles ?? sessionUser?.role;
  const isAdminUser = isAdmin(userRoles);

  const engagement = await getBlogEngagement(post.id, currentUserId);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt ?? undefined,
          image: featuredImage ?? undefined,
          datePublished: post.publishedAt?.toISOString(),
          dateModified: post.updatedAt?.toISOString(),
          author: post.author
            ? { "@type": "Person", name: post.author.name }
            : undefined,
          publisher: {
            "@type": "Organization",
            name: "Aldera Tech",
            logo: {
              "@type": "ImageObject",
              url: `${appUrl}/logo/logo-transparent.png`,
            },
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${appUrl}/blog/${post.slug}`,
          },
        }}
      />

      <ReadingProgressBar />
      <BlogViewIncrementer slug={post.slug} />
      <BlogArticleLayout
        post={post}
        minutes={minutes}
        featuredImage={featuredImage}
        engagement={engagement}
        currentUserId={currentUserId}
        isAdminUser={isAdminUser}
      />
    </>
  );
}
