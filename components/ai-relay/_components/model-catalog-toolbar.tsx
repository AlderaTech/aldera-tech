import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ModelCategory } from "@/lib/ai-relay-utils";

const CATEGORIES: ModelCategory[] = [
  "All",
  "Coding",
  "Reasoning",
  "Vision",
  "Fast",
  "Budget",
];

interface ModelCatalogToolbarProps {
  selectedCategory: ModelCategory;
  onCategoryChange: (category: ModelCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ModelCatalogToolbar({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: ModelCatalogToolbarProps) {
  return (
    <div
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      data-relay-catalog-toolbar
    >
      <div className="flex flex-wrap gap-1.5" data-relay-categories>
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            type="button"
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(category)}
            aria-pressed={selectedCategory === category}
            className={
              selectedCategory === category
                ? "h-8 rounded-full bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-700"
                : "h-8 rounded-full px-3 text-xs text-slate-700 hover:bg-slate-100"
            }
          >
            {category}
          </Button>
        ))}
      </div>
      <div className="relative w-full sm:w-72" data-relay-search>
        <Search
          aria-hidden="true"
          className="absolute top-2.5 left-2.5 h-4 w-4 text-slate-400"
        />
        <Input
          aria-label="Cari model, ID, atau kegunaan"
          placeholder="Cari model, ID, atau kegunaan..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-9 bg-white pl-8 text-xs"
        />
      </div>
    </div>
  );
}
