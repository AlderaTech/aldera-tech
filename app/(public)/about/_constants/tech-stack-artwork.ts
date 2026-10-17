import web from "@/public/images/about/technology/web.webp";
import backend from "@/public/images/about/technology/backend.webp";
import mobile from "@/public/images/about/technology/mobile.webp";
import cloud from "@/public/images/about/technology/cloud.webp";
import design from "@/public/images/about/technology/design.webp";
import ai from "@/public/images/about/technology/ai.webp";
import type { TechStackCategory } from "../_utils/group-tech-stack";

const artwork = { web, backend, mobile, cloud, design, ai };

const categoryArtwork: Record<TechStackCategory, keyof typeof artwork> = {
  Frontend: "web",
  Backend: "backend",
  Mobile: "mobile",
  "Cloud & DevOps": "cloud",
  "UI/UX": "design",
  "AI/LLM": "ai",
};

export function getTechStackArtwork(category: TechStackCategory) {
  return artwork[categoryArtwork[category]];
}
