import type { StaticImageData } from "next/image";
import ai from "@/public/images/services/cards/ai.webp";
import cloud from "@/public/images/services/cards/cloud.webp";
import commerce from "@/public/images/services/cards/commerce.webp";
import consulting from "@/public/images/services/cards/consulting.webp";
import design from "@/public/images/services/cards/design.webp";
import mobile from "@/public/images/services/cards/mobile.webp";
import quality from "@/public/images/services/cards/quality.webp";
import seo from "@/public/images/services/cards/seo.webp";
import web from "@/public/images/services/cards/web.webp";

const serviceArtwork = new Map<string, StaticImageData>([
  ["web-development", web],
  ["web-application-engineering", web],
  ["mobile-app", mobile],
  ["mobile-app-development", mobile],
  ["ui-ux-design", design],
  ["ui-ux-product-design", design],
  ["enterprise-cloud-devops", cloud],
  ["ai-machine-learning-solutions", ai],
  ["maintenance-quality-engineering", quality],
  ["ecommerce", commerce],
  ["seo-optimization", seo],
  ["consulting", consulting],
]);

export function getServiceArtwork(slug: string) {
  return serviceArtwork.get(slug);
}
