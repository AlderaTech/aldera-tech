import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { projectStatusMeta, invoiceStatusMeta } from "@/lib/status-meta";
import { isStaff } from "@/lib/permissions";

import { ProjectOverviewTab } from "./_components/overview-tab";
import { MilestonesTab } from "./_components/milestones-tab";
import { ActivityTab } from "./_components/activity-tab";
import { MessagesTab } from "@/components/dashboard/messages-tab";
import { TimeTab } from "@/components/dashboard/time-tab";
import { ProjectTaskBoard } from "@/components/dashboard/project-task-board";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProjectDetail({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  const project = await safeDb(
    async () =>
      await prisma.project.findUnique({
        where: { id },
        include: {
          client: { select: { id: true, name: true, email: true, company: true } },
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
            take: 50,
            include: { user: { select: { name: true } } },
          },
          files: { orderBy: { createdAt: "desc" } },
          invoices: { orderBy: { issueDate: "desc" } },
          messages: {
            orderBy: { createdAt: "asc" },
            include: { author: { select: { id: true, name: true, role: true } } },
          },
          timeEntries: {
            orderBy: { startedAt: "desc" },
            include: { user: { select: { id: true, name: true } } },
          },
          assignments: {
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      }),
    null
  );

  if (!project) notFound();

  const meta = projectStatusMeta[project.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/admin/projects">
              <ArrowLeft className="size-4" /> Kembali ke Proyek
            </Link>
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl xxxl:text-3xl font-bold tracking-tight">
              {project.title}
            </h1>
            <Badge variant={meta.variant}>{meta.label}</Badge>
          </div>
          <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {getInitials(project.client.name)}
                </AvatarFallback>
              </Avatar>
              {project.client.name}
              {project.client.company && (
                <span className="text-xs">({project.client.company})</span>
              )}
            </div>
            {project.deadline && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3.5" />
                {formatDate(project.deadline)}
              </span>
            )}
            {project.budget && (
              <span className="inline-flex items-center gap-1">
                <Wallet className="size-3.5" />
                {formatCurrency(Number(project.budget))}
              </span>
            )}
          </div>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Progres</span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {project.progress}%
              </span>
            </div>
            <Progress value={project.progress} />
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="w-full overflow-x-auto justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">
            Milestones ({project.milestones.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({project.tasks.length})</TabsTrigger>
          <TabsTrigger value="activity">
            Activity ({project.activities.length})
          </TabsTrigger>
          <TabsTrigger value="messages">
            Diskusi ({project.messages.filter((m) => !m.deletedAt).length})
          </TabsTrigger>
          <TabsTrigger value="time">
            Time ({project.timeEntries.length})
          </TabsTrigger>
          <TabsTrigger value="files">Files ({project.files.length})</TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices ({project.invoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ProjectOverviewTab
            project={{
              id: project.id,
              title: project.title,
              description: project.description,
              status: project.status,
              progress: project.progress,
              autoProgress: project.autoProgress,
              deadline: project.deadline,
              budget: project.budget ? project.budget.toString() : null,
            }}
          />
        </TabsContent>

        <TabsContent value="milestones" className="mt-6">
          <MilestonesTab projectId={project.id} milestones={project.milestones} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <ProjectTaskBoard
            projectId={project.id}
            tasks={project.tasks}
            milestones={project.milestones.map((milestone) => ({
              id: milestone.id,
              title: milestone.title,
            }))}
            assignees={project.assignments.map((assignment) => ({
              id: assignment.user.id,
              name: assignment.user.name,
            }))}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityTab
            projectId={project.id}
            activities={project.activities}
          />
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <MessagesTab
            projectId={project.id}
            messages={project.messages}
            currentUserId={session?.user?.id ?? ""}
            isStaff={isStaff(session?.user?.role)}
          />
        </TabsContent>

        <TabsContent value="time" className="mt-6">
          <TimeTab
            projectId={project.id}
            entries={project.timeEntries}
            currentUserId={session?.user?.id ?? ""}
          />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          {project.files.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground">
              Belum ada file. Upload di tab File Manager global.
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {project.files.map((f) => (
                <Card key={f.id} className="p-4 hover:shadow-md transition-shadow">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="font-medium truncate">{f.originalName}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {(f.size / 1024).toFixed(1)} KB · {f.mimeType}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(f.createdAt)}
                    </div>
                  </a>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          {project.invoices.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground">
              Belum ada invoice untuk proyek ini.
            </Card>
          ) : (
            <div className="space-y-3">
              {project.invoices.map((inv) => {
                const m = invoiceStatusMeta[inv.status];
                return (
                  <Link key={inv.id} href={`/admin/invoices/${inv.id}`}>
                    <Card className="p-4 hover:shadow-md hover:border-primary/50 transition-all flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <div className="font-medium">{inv.number}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Issued: {formatDate(inv.issueDate)} · Due:{" "}
                          {formatDate(inv.dueDate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          {formatCurrency(Number(inv.total))}
                        </span>
                        <Badge variant={m.variant}>{m.label}</Badge>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
