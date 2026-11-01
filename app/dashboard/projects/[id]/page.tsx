import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { MessagesTab } from "@/components/dashboard/messages-tab";
import { ProjectTaskBoard } from "@/components/dashboard/project-task-board";
import {
  dashboardTabsListClass,
  dashboardTabsTriggerClass,
} from "@/components/dashboard/dashboard-tabs";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { DASHBOARD_ROUTES } from "@/lib/routes";

import { ProjectActivityTab } from "./_components/project-activity-tab";
import { ProjectFilesTab } from "./_components/project-files-tab";
import { ProjectHeader } from "./_components/project-header";
import { ProjectInvoicesTab } from "./_components/project-invoices-tab";
import { ProjectTimelineTab } from "./_components/project-timeline-tab";
import { ProjectReviewPrompt } from "./_components/project-review-prompt";
import { ProjectTabs } from "./_components/project-tabs";
import styles from "./_components/project-detail.module.css";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
};

export default async function UserProjectDetail({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const resolvedParams = searchParams ? await searchParams : undefined;
  const session = await auth();
  const userId = session!.user.id;
  const isAdmin = session!.user.role === "ADMIN";

  const project = await safeDb(
    async () =>
      await prisma.project.findUnique({
        where: { id },
        include: {
          milestones: { orderBy: { order: "asc" } },
          tasks: {
            orderBy: [{ status: "asc" }, { order: "asc" }],
            include: {
              assignee: { select: { id: true, name: true } },
              milestone: { select: { id: true, title: true } },
            },
          },
          activities: {
            orderBy: { createdAt: "desc" },
            take: 30,
            include: { user: { select: { name: true } } },
          },
          testimonial: true,
          files: { orderBy: { createdAt: "desc" } },
          invoices: {
            where: { status: { not: "DRAFT" } },
            orderBy: { issueDate: "desc" },
          },
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              author: { select: { id: true, name: true, roles: true } },
            },
          },
        },
      }),
    null
  );

  if (!project) notFound();
  if (!isAdmin && project.clientId !== userId)
    redirect(DASHBOARD_ROUTES.projects);

  return (
    <div className={styles.page}>
      <ProjectHeader
        title={project.title}
        status={project.status}
        description={project.description}
        deadline={project.deadline}
        budget={project.budget}
        progress={project.progress}
      />

      {project.status === "COMPLETED" && (
        <ProjectReviewPrompt
          projectId={project.id}
          projectTitle={project.title}
          existingReview={project.testimonial}
        />
      )}

      <ProjectTabs initialTab={resolvedParams?.tab}>
        <TabsList className={dashboardTabsListClass}>
          <TabsTrigger value="timeline" className={dashboardTabsTriggerClass}>
            Timeline
          </TabsTrigger>
          <TabsTrigger value="tasks" className={dashboardTabsTriggerClass}>
            Tasks ({project.tasks.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className={dashboardTabsTriggerClass}>
            Activity
          </TabsTrigger>
          <TabsTrigger value="messages" className={dashboardTabsTriggerClass}>
            Diskusi ({project.messages.filter((m) => !m.deletedAt).length})
          </TabsTrigger>
          <TabsTrigger value="files" className={dashboardTabsTriggerClass}>
            Files ({project.files.length})
          </TabsTrigger>
          <TabsTrigger value="invoices" className={dashboardTabsTriggerClass}>
            Invoices ({project.invoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-4">
          <ProjectTimelineTab milestones={project.milestones} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <ProjectTaskBoard
            projectId={project.id}
            tasks={project.tasks}
            milestones={project.milestones.map((milestone) => ({
              id: milestone.id,
              title: milestone.title,
            }))}
            assignees={[]}
            readOnly
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <ProjectActivityTab activities={project.activities} />
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
          <MessagesTab
            projectId={project.id}
            messages={project.messages}
            currentUserId={userId}
            isStaff={isAdmin}
          />
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <ProjectFilesTab projectId={project.id} files={project.files} />
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <ProjectInvoicesTab invoices={project.invoices} />
        </TabsContent>
      </ProjectTabs>
    </div>
  );
}
