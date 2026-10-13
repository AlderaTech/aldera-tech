import Image from "next/image";
import { FadeUp } from "@/components/shared/motion";

type PortfolioFeaturedImageProps = {
  src: string | null;
  alt: string;
};

export function PortfolioFeaturedImage({
  src,
  alt,
}: PortfolioFeaturedImageProps) {
  if (!src) return null;

  return (
    <section className="editorial-surface">
      <div className="public-container-px mx-auto max-w-screen-xxxl py-10">
        <FadeUp>
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-black/10 shadow-2xl">
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(min-width: 1280px) 1200px, 100vw"
              className="object-cover"
              preload
            />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
