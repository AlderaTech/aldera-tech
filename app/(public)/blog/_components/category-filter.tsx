import Link from "next/link";
import type { BlogCategoryFilter } from "../_data/blog-list";
import { PUBLIC_ROUTES } from "@/lib/routes";

export function CategoryFilter({
  categories,
  activeCategory,
}: {
  categories: BlogCategoryFilter[];
  activeCategory?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <FilterLink href={PUBLIC_ROUTES.blog} active={!activeCategory}>
        Semua
      </FilterLink>
      {categories.map((category) => (
        <FilterLink
          key={category.slug}
          href={PUBLIC_ROUTES.blogCategory(category.slug)}
          active={activeCategory === category.slug}
        >
          {category.name}
        </FilterLink>
      ))}
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active
          ? "border-[#08090d] bg-[#08090d] text-white"
          : "border-black/10 bg-white/70 hover:bg-white"
      }`}
    >
      {children}
    </Link>
  );
}
