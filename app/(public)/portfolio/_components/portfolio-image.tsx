"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";

type PortfolioImageProps = {
  src: string | null;
  alt: string;
  sizes: string;
  imageClassName: string;
  fallbackClassName: string;
  preload?: boolean;
};

export function PortfolioImage({
  src,
  alt,
  sizes,
  imageClassName,
  fallbackClassName,
  preload = false,
}: PortfolioImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className={fallbackClassName} aria-hidden="true">
        <ImageOff className="size-6" strokeWidth={1.25} />
        <span>Pratinjau belum tersedia</span>
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      quality={85}
      preload={preload}
      className={imageClassName}
      onError={() => setFailed(true)}
    />
  );
}
