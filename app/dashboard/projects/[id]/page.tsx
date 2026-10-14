import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { MessagesTab } from "@/components/dashboard/messages-tab";
import { ProjectTaskBoard } from "@/components/dashboard/project-task-board";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { DASHBOARD_ROUTES } from "@/lib/routes";

import { ProjectActivityTab } from "./_components/project-activity-tab";
import { ProjectFilesTab } from "./_components/project-files-tab";
import { ProjectHeader } from "./_components/project-header";
import { ProjectInvoicesTab } from "./_components/project-invoices-tab";
import { ProjectTimelineTab } from "./_components/project-timeline-tab";
import { ProjectReviewPrompt } from "./_components/project-review-prompt";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function UserProjectDetail({ params }: PageProps) {
  const { id } = await params;
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
          invoices: { orderBy: { issueDate: "desc" } },
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
    <div className="space-y-6">
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

      <Tabs defaultValue="timeline">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks ({project.tasks.length})
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="messages">
            Diskusi ({project.messages.filter((m) => !m.deletedAt).length})
          </TabsTrigger>
          <TabsTrigger value="files">
            Files ({project.files.length})
          </TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices ({project.invoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          <ProjectTimelineTab milestones={project.milestones} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
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

        <TabsContent value="activity" className="mt-6">
          <ProjectActivityTab activities={project.activities} />
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <MessagesTab
            projectId={project.id}
            messages={project.messages}
            currentUserId={userId}
            isStaff={isAdmin}
          />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <ProjectFilesTab projectId={project.id} files={project.files} />
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <ProjectInvoicesTab invoices={project.invoices} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
