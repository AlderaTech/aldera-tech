import Link from "next/link";
import { Plus, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { ADMIN_ROUTES } from "@/lib/routes";
import { safeDb } from "@/lib/safe-db";
import { BlogTable } from "./_components/blog-table";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { ParamFilterSelect } from "@/components/shared/param-filter-select";
import type { Prisma } from "@prisma/client";

const blogStatusOptions = [
  { label: "Semua Status", value: "ALL" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
];

export interface AdminBlogPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminBlogPage({
  searchParams,
}: AdminBlogPageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp?.page) || 1);
  const PAGE_SIZE = 10;
  const q = sp?.q?.trim();
  const rawStatus = sp?.status?.trim()?.toUpperCase();

  const where: Prisma.BlogPostWhereInput = {};
  if (rawStatus === "PUBLISHED") {
    where.published = true;
  } else if (rawStatus === "DRAFT") {
    where.published = false;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }

  const [posts, totalCount] = await safeDb(
    async () =>
      await Promise.all([
        prisma.blogPost.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
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
        prisma.blogPost.count({ where }),
      ]),
    [[], 0]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
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

      <SearchFilterBar
        placeholder="Cari judul artikel blog..."
        searchParamKey="q"
      >
        <ParamFilterSelect
          paramKey="status"
          options={blogStatusOptions}
          placeholder="Filter status..."
        />
      </SearchFilterBar>

      <Card className="overflow-hidden p-0">
        <BlogTable
          posts={posts}
          totalItems={totalCount}
          currentPage={page}
          pageSize={PAGE_SIZE}
        />
      </Card>
    </div>
  );
}
