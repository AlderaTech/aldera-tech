import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveCaseStudyImage } from "@/lib/public-fallbacks";
import { PUBLIC_ROUTES } from "@/lib/routes";
import {
  getPortfolioItem,
  getPortfolioStaticParams,
} from "../_data/portfolio";
import { PortfolioDetailContent } from "./_components/portfolio-detail-content";
import { PortfolioCta } from "./_components/portfolio-cta";
import { PortfolioFeaturedImage } from "./_components/portfolio-featured-image";
import { PortfolioDetailHero } from "./_components/portfolio-detail-hero";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPortfolioItem(slug);
  if (!item) return { title: "Portfolio tidak ditemukan" };

  const featuredImage = resolveCaseStudyImage(item.slug, item.featuredImage);

  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: PUBLIC_ROUTES.portfolioDetail(item.slug) },
    openGraph: {
      title: item.title,
      description: item.summary,
      images: featuredImage ? [featuredImage] : undefined,
    },
  };
}

export async function generateStaticParams() {
  return getPortfolioStaticParams();
}

export default async function PortfolioDetail({ params }: PageProps) {
  const { slug } = await params;
  const item = await getPortfolioItem(slug);
  if (!item) notFound();

  const featuredImage = resolveCaseStudyImage(item.slug, item.featuredImage);

  return (
    <>
      <PortfolioDetailHero item={item} />
      <PortfolioFeaturedImage src={featuredImage} alt={item.title} />
      <PortfolioDetailContent item={item} />
      <PortfolioCta />
    </>
  );
}
