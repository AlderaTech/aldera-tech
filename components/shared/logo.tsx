import Image from "next/image";
import Link from "next/link";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  href?: string | null;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
};

const sizes = {
  sm: { px: 28, text: "text-base" },
  md: { px: 36, text: "text-lg" },
  lg: { px: 48, text: "text-2xl" },
} as const;

export function Logo({
  className,
  href = PUBLIC_ROUTES.home,
  size = "md",
  showText = true,
}: LogoProps) {
  const s = sizes[size];
  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="relative shrink-0 rounded-md overflow-hidden bg-white ring-1 ring-border" style={{ width: s.px, height: s.px }}>
        <Image
          src="/logo.png"
          alt="Solvo Tech"
          fill
          sizes={`${s.px}px`}
          className="object-contain p-0.5"
        />
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight", s.text)}>
          Solvo<span className="text-primary">Tech</span>
        </span>
      )}
    </div>
  );
  if (!href) return content;
  return (
    <Link href={href} className="inline-flex transition-opacity hover:opacity-80">
      {content}
    </Link>
  );
}
