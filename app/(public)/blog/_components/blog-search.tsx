import { Search } from "lucide-react";
import { PUBLIC_ROUTES } from "@/lib/routes";
import styles from "./blog.module.css";

export function BlogSearch({ category, q }: { category?: string; q?: string }) {
  return (
    <form
      action={PUBLIC_ROUTES.blog}
      method="get"
      className={styles.search}
      role="search"
    >
      {category && <input type="hidden" name="category" value={category} />}
      <label htmlFor="blog-search" className="sr-only">
        Cari artikel
      </label>
      <Search className="size-4" aria-hidden="true" />
      <input
        key={q ?? ""}
        id="blog-search"
        name="q"
        type="search"
        defaultValue={q ?? ""}
        placeholder="Cari artikel..."
      />
      <button type="submit">Cari</button>
    </form>
  );
}
