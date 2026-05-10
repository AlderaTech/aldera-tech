import Image from "next/image";

type BlogFeaturedImageProps = {
  src: string | null;
  alt: string;
};

export function BlogFeaturedImage({ src, alt }: BlogFeaturedImageProps) {
  if (!src) return null;

  return (
    <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl border border-black/10 shadow-xl">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 800px, 100vw"
        className="object-cover"
        preload
      />
    </div>
  );
}
