import {
  Globe,
  Code2,
  FileCode,
  Palette,
  Layers,
  Server,
  Cpu,
  Terminal,
  Database,
  Zap,
  Smartphone,
  Box,
  Boxes,
  Cloud,
  Shield,
  GitBranch,
  Layout,
  BookOpen,
  BrainCircuit,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import { techStack } from "../_constants/about-content";

const CATEGORY_ORDER = [
  "Frontend",
  "Backend",
  "Mobile",
  "Cloud & DevOps",
  "UI/UX",
  "AI/LLM",
] as const;

const iconMap: Record<string, LucideIcon> = {
  Globe,
  Code2,
  FileCode,
  Palette,
  Layers,
  Server,
  Cpu,
  Terminal,
  Database,
  Zap,
  Smartphone,
  Box,
  Boxes,
  Cloud,
  Shield,
  GitBranch,
  Layout,
  BookOpen,
  BrainCircuit,
  Sparkles,
};

function resolveTechIcon(icon?: string | null): LucideIcon | null {
  if (!icon) return null;
  return iconMap[icon] ?? null;
}

type ToolDisplayItem = {
  name: string;
  category: string;
  icon?: string | null;
};

export async function TechStackSection() {
  const dbTools = await safeDb<ToolDisplayItem[]>(async () => {
    const data = await prisma.techTool.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      select: {
        name: true,
        category: true,
        icon: true,
      },
    });
    return data;
  }, []);

  const itemsToUse: ToolDisplayItem[] =
    dbTools && dbTools.length > 0
      ? dbTools
      : techStack.map((item) => ({
          name: item.name,
          category: item.category,
        }));

  const groups = new Map<string, ToolDisplayItem[]>();
  for (const item of itemsToUse) {
    const cat = item.category;
    if (!groups.has(cat)) {
      groups.set(cat, []);
    }
    groups.get(cat)!.push(item);
  }

  const sortedCategories = [
    ...CATEGORY_ORDER.filter((c) => groups.has(c)),
    ...Array.from(groups.keys()).filter(
      (c) => !CATEGORY_ORDER.includes(c as (typeof CATEGORY_ORDER)[number])
    ),
  ];

  return (
    <section className="editorial-surface">
      <div className="public-container-px mx-auto max-w-screen-xxxl py-14 sm:py-20">
        <FadeUp className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="editorial-display text-4xl text-balance sm:text-5xl">
            Alat yang kami kuasai
          </h2>
          <p className="mt-4 text-black/60">
            Kami percaya pada alat yang tepat untuk setiap masalah, bukan satu
            alat untuk semua.
          </p>
        </FadeUp>
        <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedCategories.map((category) => {
            const categoryTools = groups.get(category) ?? [];
            return (
              <StaggerItem key={category}>
                <Card className="editorial-card flex h-full flex-col rounded-2xl p-6 transition-all hover:shadow-md">
                  <div className="mb-4 flex items-center justify-between border-b border-black/10 pb-3">
                    <h3 className="font-serif text-lg font-bold text-black/90">
                      {category}
                    </h3>
                    <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-semibold text-black/60">
                      {categoryTools.length} alat
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categoryTools.map((item) => {
                      const Icon = resolveTechIcon(item.icon);
                      return (
                        <div
                          key={item.name}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3.5 py-1.5 text-sm font-medium text-black/80 transition-all hover:border-[#0b6bff]/40 hover:bg-white hover:text-[#0b6bff] hover:shadow-sm"
                        >
                          {Icon && (
                            <Icon className="size-4 shrink-0 text-[#0b6bff]" />
                          )}
                          <span>{item.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
