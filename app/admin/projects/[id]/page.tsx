import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { ProjectDetailHeader } from "./_components/project-detail-header";
import { ProjectDetailTabs } from "./_components/project-detail-tabs";
import { getAdminProjectDetail } from "./_data/project-detail";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProjectDetail({ params }: PageProps) {
  const { id } = await params;
  const [session, project] = await Promise.all([
    auth(),
    getAdminProjectDetail(id),
  ]);

  if (!project) notFound();

  return (
    <div className="space-y-5">
      <ProjectDetailHeader project={project} />
      <ProjectDetailTabs project={project} session={session} />
    </div>
  );
}
