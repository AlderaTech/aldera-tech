import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  MessageSquare,
  Timer,
  Wallet,
} from "lucide-react";
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
import { FileUploader } from "@/components/dashboard/file-uploader";

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
  const completedMilestones = project.milestones.filter(
    (milestone) => milestone.status === "COMPLETED"
  ).length;
  const openTasks = project.tasks.filter((task) => task.status !== "DONE").length;
  const completedTimeEntries = project.timeEntries.filter(
    (entry) => entry.endedAt
  );
  const trackedSeconds = completedTimeEntries.reduce(
    (total, entry) => total + entry.durationSec,
    0
  );
  const trackedHours = trackedSeconds / 3600;
  const activeMessages = project.messages.filter((message) => !message.deletedAt);

  const summaryItems = [
    {
      label: "Milestone selesai",
      value: `${completedMilestones}/${project.milestones.length}`,
      icon: CheckCircle2,
    },
    {
      label: "Task terbuka",
      value: openTasks,
      icon: Clock3,
    },
    {
      label: "Diskusi aktif",
      value: activeMessages.length,
      icon: MessageSquare,
    },
    {
      label: "Jam tercatat",
      value: trackedHours > 0 ? trackedHours.toFixed(1) : "0",
      icon: Timer,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 space-y-3">
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
            <div className="flex items-center gap-3 flex-wrap text-sm text-slate-600">
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

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-medium text-slate-500">
                  {item.label}
                </div>
                <item.icon className="size-4 text-primary" />
              </div>
              <div className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-slate-200 bg-white p-4 shadow-sm">
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

      <Tabs defaultValue="overview" className="gap-0">
        <div className="sticky top-16 z-20 -mx-1 overflow-x-auto border-b border-slate-200 bg-slate-50/95 px-1 py-2 backdrop-blur">
          <TabsList className="h-auto w-max justify-start gap-1 bg-white p-1 shadow-sm">
            <TabsTrigger value="overview" className="gap-2">
              <FolderOpen className="size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="milestones" className="gap-2">
              <CheckCircle2 className="size-4" />
              Milestones
              <span className="rounded bg-slate-100 px-1.5 text-xs">
                {project.milestones.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <Clock3 className="size-4" />
              Tasks
              <span className="rounded bg-slate-100 px-1.5 text-xs">
                {project.tasks.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="size-4" />
              Activity
              <span className="rounded bg-slate-100 px-1.5 text-xs">
                {project.activities.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageSquare className="size-4" />
              Diskusi
              <span className="rounded bg-slate-100 px-1.5 text-xs">
                {activeMessages.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="time" className="gap-2">
              <Timer className="size-4" />
              Time
              <span className="rounded bg-slate-100 px-1.5 text-xs">
                {project.timeEntries.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2">
              <FolderOpen className="size-4" />
              Files
              <span className="rounded bg-slate-100 px-1.5 text-xs">
                {project.files.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2">
              <FileText className="size-4" />
              Invoices
              <span className="rounded bg-slate-100 px-1.5 text-xs">
                {project.invoices.length}
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4">
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

        <TabsContent value="milestones" className="mt-4">
          <MilestonesTab projectId={project.id} milestones={project.milestones} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
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

        <TabsContent value="activity" className="mt-4">
          <ActivityTab
            projectId={project.id}
            activities={project.activities}
          />
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
          <MessagesTab
            projectId={project.id}
            messages={project.messages}
            currentUserId={session?.user?.id ?? ""}
            isStaff={isStaff(session?.user?.role)}
          />
        </TabsContent>

        <TabsContent value="time" className="mt-4">
          <TimeTab
            projectId={project.id}
            entries={project.timeEntries}
            currentUserId={session?.user?.id ?? ""}
          />
        </TabsContent>

        <TabsContent value="files" className="mt-4">
          <div className="space-y-4">
            <Card className="border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3">
                <h2 className="text-base font-semibold">Upload file proyek</h2>
                <p className="text-sm text-muted-foreground">
                  File akan langsung terhubung ke project ini.
                </p>
              </div>
              <FileUploader projectId={project.id} />
            </Card>

            {project.files.length === 0 ? (
              <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
                Belum ada file untuk proyek ini.
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {project.files.map((f) => (
                  <Card
                    key={f.id}
                    className="border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
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
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <h2 className="text-base font-semibold">Invoice proyek</h2>
              <p className="text-sm text-muted-foreground">
                Pantau tagihan yang terhubung dengan project ini.
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/invoices/new">
                <FileText className="size-4" />
                Invoice Baru
              </Link>
            </Button>
          </div>
          {project.invoices.length === 0 ? (
            <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
              Belum ada invoice untuk proyek ini.
            </Card>
          ) : (
            <div className="space-y-3">
              {project.invoices.map((inv) => {
                const m = invoiceStatusMeta[inv.status];
                return (
                  <Link key={inv.id} href={`/admin/invoices/${inv.id}`}>
                    <Card className="flex items-center justify-between gap-3 border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md flex-wrap">
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
