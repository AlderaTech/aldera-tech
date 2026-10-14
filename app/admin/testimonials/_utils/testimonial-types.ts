export type TestimonialItem = {
  id: string;
  clientName: string;
  clientRole: string | null;
  content: string;
  rating: number;
  avatar: string | null;
  published: boolean;
  order: number;
  projectId: string | null;
  clientId: string | null;
  createdAt: Date;
  updatedAt: Date;
  project?: { id: string; title: string } | null;
  client?: { id: string; name: string; email: string } | null;
};

export type CompletedProjectOption = {
  id: string;
  title: string;
  clientName?: string;
};
