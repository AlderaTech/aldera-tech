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
import type { TechStackCategory } from "../_utils/group-tech-stack";

type CategoryVisual = { icon: LucideIcon; description: string };

const categoryVisuals: Record<TechStackCategory, CategoryVisual> = {
  Frontend: {
    icon: Layout,
    description: "Antarmuka dan pengalaman pengguna di setiap layar.",
  },
  Backend: {
    icon: Server,
    description: "Logika, integrasi, dan fondasi di balik produk digital.",
  },
  Mobile: {
    icon: Smartphone,
    description: "Pengalaman aplikasi dalam genggaman pengguna.",
  },
  "Cloud & DevOps": {
    icon: Cloud,
    description: "Infrastruktur, deployment, dan operasional produk.",
  },
  "UI/UX": {
    icon: Palette,
    description: "Dari alur pengguna hingga detail antarmuka.",
  },
  "AI/LLM": {
    icon: BrainCircuit,
    description: "Model, integrasi, dan orkestrasi kecerdasan buatan.",
  },
};

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

const toolIcons: Record<string, LucideIcon> = {
  "next.js": Globe,
  typescript: FileCode,
  react: Code2,
  postgresql: Database,
  prisma: Boxes,
  "tailwind css": Palette,
  "react native": Smartphone,
  "node.js": Terminal,
  aws: Cloud,
  figma: Palette,
  "framer motion": Zap,
  docker: Box,
};

export function getCategoryVisual(category: TechStackCategory): CategoryVisual {
  return categoryVisuals[category];
}

export function getToolIcon(
  name: string,
  configuredIcon?: string | null
): LucideIcon {
  return (
    (configuredIcon && iconMap[configuredIcon]) ||
    toolIcons[name.toLowerCase()] ||
    Code2
  );
}
