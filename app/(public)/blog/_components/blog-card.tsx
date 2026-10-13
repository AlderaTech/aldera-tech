import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { formatDate, readingTime } from "@/lib/utils";
import type { BlogListItem } from "../_data/blog-list";

export function BlogCard({ post }: { post: BlogListItem }) {
  const minutes = readingTime(post.content);

  return (
    <Link
      href={PUBLIC_ROUTES.blogDetail(post.slug)}
      className="group block h-full"
    >
      <Card className="h-full overflow-hidden rounded-xl p-0 transition-all hover:-translate-y-1 hover:shadow-xl">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
          {post.category && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-[#0b6bff] text-white hover:bg-[#0b6bff]">
                {post.category.name}
              </Badge>
            </div>
          )}
        </div>
        <div className="space-y-3 bg-white/80 p-5">
          <h2 className="line-clamp-2 text-xl leading-snug font-black transition-colors group-hover:text-[#0b6bff]">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="line-clamp-2 text-sm text-black/60">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-3 border-t border-black/10 pt-2 text-xs text-black/48">
            {post.publishedAt && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3" />
                {formatDate(post.publishedAt, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" />
              {minutes} menit baca
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
