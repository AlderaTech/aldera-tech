import Link from "next/link";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { BLOG_PAGE_SIZE } from "../_data/blog-list";

export function BlogPagination({
  page,
  postCount,
  category,
  q,
}: {
  page: number;
  postCount: number;
  category?: string;
  q?: string;
}) {
  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      {page > 1 && (
        <Link
          href={PUBLIC_ROUTES.blogPage({ category, q, page: page - 1 })}
          className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          ← Sebelumnya
        </Link>
      )}
      {postCount === BLOG_PAGE_SIZE && (
        <Link
          href={PUBLIC_ROUTES.blogPage({ category, q, page: page + 1 })}
          className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm hover:bg-accent"
        >
          Berikutnya →
        </Link>
      )}
    </div>
  );
}
