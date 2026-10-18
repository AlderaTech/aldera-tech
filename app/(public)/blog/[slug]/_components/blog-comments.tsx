"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MessageSquare, Trash2, Send, Lock } from "lucide-react";
import { toast } from "sonner";
import {
  createBlogCommentAction,
  deleteBlogCommentAction,
} from "@/lib/actions/blog";
import { formatDate } from "@/lib/utils";
import { AUTH_ROUTES } from "@/lib/routes";
import type { BlogCommentItem } from "../_data/blog-detail";

type BlogCommentsProps = {
  postId: string;
  initialComments: BlogCommentItem[];
  currentUserId?: string;
  isAdminUser: boolean;
};

export function BlogComments({
  postId,
  initialComments,
  currentUserId,
  isAdminUser,
}: BlogCommentsProps) {
  const [comments, setComments] = useState<BlogCommentItem[]>(initialComments);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const isAuthenticated = Boolean(currentUserId);
  const trimmed = content.trim();
  const isValidLength = trimmed.length >= 1 && trimmed.length <= 2000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Silakan masuk untuk menulis komentar.");
      return;
    }
    if (!isValidLength) {
      if (trimmed.length < 1) {
        toast.error("Komentar tidak boleh kosong.");
      } else {
        toast.error("Komentar maksimal 2000 karakter.");
      }
      return;
    }

    startTransition(async () => {
      try {
        const res = await createBlogCommentAction(postId, trimmed);
        if (res.ok && res.commentId) {
          toast.success("Komentar berhasil dipublikasikan.");
          setComments((prev) => [
            ...prev,
            {
              id: res.commentId!,
              content: trimmed,
              createdAt: new Date(),
              authorId: currentUserId!,
              authorName: "Anda",
            },
          ]);
          setContent("");
        } else {
          toast.error(res.error || "Gagal mengirim komentar.");
        }
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Gagal mengirim komentar."
        );
      }
    });
  };

  const handleDelete = (commentId: string) => {
    startTransition(async () => {
      try {
        const res = await deleteBlogCommentAction(commentId);
        if (res.ok) {
          toast.success("Komentar berhasil dihapus.");
          setComments((prev) => prev.filter((c) => c.id !== commentId));
        }
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Gagal menghapus komentar."
        );
      }
    });
  };

  return (
    <section
      aria-label="Kolom Komentar"
      className="mt-12 border-t border-[var(--home-line)] pt-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-5 text-blue-600" />
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Komentar ({comments.length})
          </h2>
        </div>
      </div>

      {/* Form Tambah Komentar / Banner Login */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white/70 shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-900/70">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis tanggapan atau pertanyaan Anda tentang artikel ini..."
              rows={3}
              maxLength={2000}
              className="w-full resize-y border-0 bg-transparent p-4 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-hidden dark:text-zinc-100 dark:placeholder-zinc-500"
            />
            <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-800/40">
              <span
                className={`text-xs ${
                  content.length > 2000
                    ? "font-semibold text-rose-500"
                    : "text-zinc-400"
                }`}
              >
                {content.length}/2000
              </span>
              <button
                type="submit"
                disabled={!isValidLength || isPending}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="size-3.5" />
                <span>Kirim</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 flex flex-col items-center justify-between gap-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/70 p-6 text-center sm:flex-row sm:text-left dark:border-zinc-700 dark:bg-zinc-800/30">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Lock className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                Masuk untuk Berdiskusi
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tulis tanggapan dan bagikan pemikiran Anda dengan komunitas Aldera Tech.
              </p>
            </div>
          </div>
          <Link
            href={AUTH_ROUTES.login}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
          >
            Masuk Sekarang
          </Link>
        </div>
      )}

      {/* Daftar Komentar */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="rounded-xl border border-zinc-200/60 bg-zinc-50/40 p-8 text-center text-xs text-zinc-500 dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:text-zinc-400">
            Belum ada komentar untuk artikel ini. Jadilah yang pertama berbagi pendapat!
          </div>
        ) : (
          comments.map((comment) => {
            const canDelete =
              Boolean(currentUserId && comment.authorId === currentUserId) ||
              isAdminUser;

            return (
              <div
                key={comment.id}
                className="group relative rounded-xl border border-zinc-200/80 bg-white/80 p-4 transition-all duration-200 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-xs font-bold text-white uppercase shadow-xs">
                      {comment.authorName ? comment.authorName[0] : "U"}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                        {comment.authorName}
                      </span>
                      <span className="ml-2 text-[11px] text-zinc-400">
                        {formatDate(comment.createdAt, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(comment.id)}
                      aria-label="Hapus komentar"
                      className="opacity-70 transition hover:opacity-100 text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 p-1"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>

                <p className="mt-2 text-xs leading-relaxed text-zinc-700 sm:text-sm dark:text-zinc-300 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
