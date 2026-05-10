import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Eye } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { formatDate, getInitials } from "@/lib/utils";
import type { BlogDetailPost } from "../_data/blog-detail";

type BlogArticleHeaderProps = {
  post: BlogDetailPost;
  minutes: number;
};

export function BlogArticleHeader({ post, minutes }: BlogArticleHeaderProps) {
  return (
    <>
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href={PUBLIC_ROUTES.blog}>
          <ArrowLeft className="size-4" /> Kembali ke Blog
        </Link>
      </Button>

      <header className="mb-8 space-y-5">
        {post.category && (
          <Link href={PUBLIC_ROUTES.blogCategory(post.category.slug)}>
            <Badge className="bg-[#0b6bff] text-white transition hover:bg-[#0b6bff]">
              {post.category.name}
            </Badge>
          </Link>
        )}
        <h1 className="editorial-display text-4xl leading-tight text-balance sm:text-5xl lg:text-6xl">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="text-lg text-black/60">{post.excerpt}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 border-t border-black/10 pt-4">
          {post.author && (
            <div className="flex items-center gap-2">
              <Avatar className="size-8">
                <AvatarFallback className="bg-[#0b6bff] text-xs text-white">
                  {getInitials(post.author.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{post.author.name}</span>
            </div>
          )}
          {post.publishedAt && (
            <span className="inline-flex items-center gap-1 text-sm text-black/50">
              <Calendar className="size-3.5" />
              {formatDate(post.publishedAt)}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-sm text-black/50">
            <Clock className="size-3.5" />
            {minutes} menit baca
          </span>
          {post.views > 0 && (
            <span className="inline-flex items-center gap-1 text-sm text-black/50">
              <Eye className="size-3.5" />
              {post.views.toLocaleString("id-ID")} tampilan
            </span>
          )}
        </div>
      </header>
    </>
  );
}
