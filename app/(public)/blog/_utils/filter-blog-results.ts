import type { BlogListItem } from "../_data/blog-list";

/** Keeps unrelated fallback posts out of filtered public results. */
export function filterBlogResults(
  posts: BlogListItem[],
  { category, q }: { category?: string; q?: string }
) {
  const term = q?.trim().toLocaleLowerCase("id-ID");

  return posts.filter((post) => {
    if (category && post.category?.slug !== category) return false;
    if (!term) return true;

    return [post.title, post.excerpt ?? ""].some((value) =>
      value.toLocaleLowerCase("id-ID").includes(term)
    );
  });
}
