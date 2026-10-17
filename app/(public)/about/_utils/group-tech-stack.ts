export const TECH_STACK_CATEGORIES = [
  "Frontend",
  "Backend",
  "Mobile",
  "Cloud & DevOps",
  "UI/UX",
  "AI/LLM",
] as const;

export type TechStackCategory = (typeof TECH_STACK_CATEGORIES)[number];

type CategorizedTool = { name: string; category: string };

const categoryAliases: Record<string, TechStackCategory> = {
  framework: "Frontend",
  language: "Backend",
  library: "Frontend",
  styling: "Frontend",
  animation: "Frontend",
  database: "Backend",
  orm: "Backend",
  runtime: "Backend",
  cloud: "Cloud & DevOps",
  devops: "Cloud & DevOps",
  design: "UI/UX",
  ui: "UI/UX",
  ux: "UI/UX",
  ai: "AI/LLM",
  llm: "AI/LLM",
};

const knownTools: Record<string, TechStackCategory> = {
  "next.js": "Frontend",
  react: "Frontend",
  typescript: "Frontend",
  "tailwind css": "Frontend",
  "framer motion": "Frontend",
  "node.js": "Backend",
  postgresql: "Backend",
  prisma: "Backend",
  "react native": "Mobile",
  aws: "Cloud & DevOps",
  docker: "Cloud & DevOps",
  figma: "UI/UX",
};

function getDisplayCategory(tool: CategorizedTool): TechStackCategory {
  const category = tool.category.trim().toLowerCase();
  const name = tool.name.trim().toLowerCase();
  const canonicalCategory = TECH_STACK_CATEGORIES.find(
    (item) => item.toLowerCase() === category
  );
  const namedCategory = Object.hasOwn(knownTools, name)
    ? knownTools[name]
    : undefined;
  const aliasedCategory = Object.hasOwn(categoryAliases, category)
    ? categoryAliases[category]
    : undefined;

  return canonicalCategory ?? namedCategory ?? aliasedCategory ?? "Backend";
}

export function groupTechStackTools<T extends CategorizedTool>(
  items: readonly T[]
) {
  const groups = new Map<TechStackCategory, T[]>(
    TECH_STACK_CATEGORIES.map((category) => [category, []])
  );

  for (const item of items) {
    groups.get(getDisplayCategory(item))?.push(item);
  }

  return TECH_STACK_CATEGORIES.map((category) => ({
    category,
    tools: groups.get(category) ?? [],
  }));
}
