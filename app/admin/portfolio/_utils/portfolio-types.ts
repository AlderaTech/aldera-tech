export type PortfolioCaseStudyItem = {
  id: string;
  slug: string;
  title: string;
  client: string;
  industry: string;
  summary: string;
  challenge: string;
  solution: string;
  result: string;
  featuredImage: string | null;
  techStack: string[];
  published: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PortfolioFormInitial = {
  id?: string;
  title: string;
  slug: string;
  client: string;
  industry: string;
  summary: string;
  challenge: string;
  solution: string;
  result: string;
  featuredImage?: string | null;
  techStack: string[];
  published: boolean;
  order: number;
};
