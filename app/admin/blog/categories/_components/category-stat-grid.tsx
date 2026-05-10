import { FileText, Hash, Tags } from "lucide-react";

import { AdminStatCard } from "../../../_components/admin-stat-card";
import type { BlogCategoryRow } from "../_utils/category-types";

export function CategoryStatGrid({
  categories,
}: {
  categories: BlogCategoryRow[];
}) {
  const assignedPosts = categories.reduce(
    (total, category) => total + category._count.posts,
    0
  );
  const emptyCategories = categories.filter(
    (category) => category._count.posts === 0
  ).length;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <AdminStatCard
        icon={Tags}
        label="Total Kategori"
        value={categories.length}
        helper="Taxonomy aktif untuk artikel"
      />
      <AdminStatCard
        icon={FileText}
        label="Post Terkategori"
        value={assignedPosts}
        helper="Artikel yang memakai kategori"
      />
      <AdminStatCard
        icon={Hash}
        label="Kategori Kosong"
        value={emptyCategories}
        helper="Perlu dipakai atau dirapikan"
      />
    </div>
  );
}
