"use client";

import { useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { toggleBlogReactionAction } from "@/lib/actions/blog";
import { cn } from "@/lib/utils";

type BlogReactionsProps = {
  postId: string;
  initialLikes: number;
  initialDislikes: number;
  initialUserReaction: "LIKE" | "DISLIKE" | null;
  isAuthenticated: boolean;
};

export function BlogReactions({
  postId,
  initialLikes,
  initialDislikes,
  initialUserReaction,
  isAuthenticated,
}: BlogReactionsProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userReaction, setUserReaction] = useState<"LIKE" | "DISLIKE" | null>(
    initialUserReaction
  );
  const [isPending, startTransition] = useTransition();

  const handleToggle = (type: "LIKE" | "DISLIKE") => {
    if (!isAuthenticated) {
      toast.info("Silakan masuk ke akun Anda untuk memberikan reaksi.");
      return;
    }

    const prevReaction = userReaction;
    const prevLikes = likes;
    const prevDislikes = dislikes;

    // Optimistic calculation
    if (type === "LIKE") {
      if (prevReaction === "LIKE") {
        setUserReaction(null);
        setLikes((l) => Math.max(0, l - 1));
      } else if (prevReaction === "DISLIKE") {
        setUserReaction("LIKE");
        setDislikes((d) => Math.max(0, d - 1));
        setLikes((l) => l + 1);
      } else {
        setUserReaction("LIKE");
        setLikes((l) => l + 1);
      }
    } else {
      if (prevReaction === "DISLIKE") {
        setUserReaction(null);
        setDislikes((d) => Math.max(0, d - 1));
      } else if (prevReaction === "LIKE") {
        setUserReaction("DISLIKE");
        setLikes((l) => Math.max(0, l - 1));
        setDislikes((d) => d + 1);
      } else {
        setUserReaction("DISLIKE");
        setDislikes((d) => d + 1);
      }
    }

    startTransition(async () => {
      try {
        const res = await toggleBlogReactionAction(postId, type);
        if (res.action === "removed") {
          toast.success("Reaksi dihapus");
        } else {
          toast.success(
            type === "LIKE" ? "Menyukai artikel ini" : "Memberi tanggapan"
          );
        }
      } catch (err: unknown) {
        // Revert on error
        setUserReaction(prevReaction);
        setLikes(prevLikes);
        setDislikes(prevDislikes);
        toast.error(
          err instanceof Error ? err.message : "Gagal mengubah reaksi"
        );
      }
    });
  };

  return (
    <section
      aria-label="Reaksi Pembaca"
      className="my-8 rounded-2xl border border-[var(--home-line)] bg-white/60 p-5 shadow-xs backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/60"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Apakah artikel ini bermanfaat?
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Berikan reaksi Anda untuk membantu kami menyajikan konten yang lebih
            baik.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleToggle("LIKE")}
            aria-label={`Suka artikel (${likes})`}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200",
              userReaction === "LIKE"
                ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs dark:bg-blue-950/50 dark:text-blue-300"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-blue-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            )}
          >
            <ThumbsUp
              className={cn(
                "size-4 transition-transform duration-200",
                userReaction === "LIKE" &&
                  "scale-110 fill-blue-600 dark:fill-blue-400"
              )}
            />
            <span>Suka</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                userReaction === "LIKE"
                  ? "bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
              )}
            >
              {likes}
            </span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleToggle("DISLIKE")}
            aria-label={`Tidak suka artikel (${dislikes})`}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200",
              userReaction === "DISLIKE"
                ? "border-rose-500 bg-rose-50 text-rose-700 shadow-xs dark:bg-rose-950/50 dark:text-rose-300"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-rose-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
            )}
          >
            <ThumbsDown
              className={cn(
                "size-4 transition-transform duration-200",
                userReaction === "DISLIKE" &&
                  "scale-110 fill-rose-500 dark:fill-rose-400"
              )}
            />
            <span>Kurang Bermanfaat</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                userReaction === "DISLIKE"
                  ? "bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
              )}
            >
              {dislikes}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
