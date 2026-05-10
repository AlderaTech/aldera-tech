import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Wallet,
  Download,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { auth } from "@/auth";
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
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  projectStatusMeta,
  milestoneStatusMeta,
  invoiceStatusMeta,
} from "@/lib/status-meta";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/shared/motion";
import { MessagesTab } from "@/components/dashboard/messages-tab";
import { ProjectTaskBoard } from "@/components/dashboard/project-task-board";
import { MilestoneApproval } from "@/components/dashboard/milestone-approval";
import { FileUploader } from "@/components/dashboard/file-uploader";

type PageProps = {
  params: Promise<{ id: string }>;
};

const milestoneIcon = {
  PENDING: Circle,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle2,
  BLOCKED: AlertCircle,
} as const;

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
          files: { orderBy: { createdAt: "desc" } },
          invoices: { orderBy: { issueDate: "desc" } },
          messages: {
            orderBy: { createdAt: "asc" },
            include: { author: { select: { id: true, name: true, role: true } } },
          },
        },
      }),
    null
  );

  if (!project) notFound();
  if (!isAdmin && project.clientId !== userId) redirect("/dashboard/projects");

  const meta = projectStatusMeta[project.status];

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/dashboard/projects">
          <ArrowLeft className="size-4" /> Kembali
        </Link>
      </Button>

      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl xxxl:text-3xl font-bold tracking-tight">
            {project.title}
          </h1>
          <Badge variant={meta.variant}>{meta.label}</Badge>
        </div>
        <p className="text-muted-foreground max-w-3xl">{project.description}</p>
        <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
          {project.deadline && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3.5" />
              Deadline: {formatDate(project.deadline)}
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

      {/* Progress bar, large + animated */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">Progres Proyek</span>
          <span className="text-2xl font-bold tabular-nums">
            {project.progress}%
          </span>
        </div>
        <Progress value={project.progress} className="h-3" />
      </Card>

      <Tabs defaultValue="timeline">
        <TabsList className="w-full overflow-x-auto justify-start">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({project.tasks.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="messages">
            Diskusi ({project.messages.filter((m) => !m.deletedAt).length})
          </TabsTrigger>
          <TabsTrigger value="files">Files ({project.files.length})</TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices ({project.invoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          {project.milestones.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground">
              Belum ada milestone.
            </Card>
          ) : (
            <StaggerContainer>
              <ol className="relative border-l-2 ml-3 space-y-5">
                {project.milestones.map((m) => {
                  const mMeta = milestoneStatusMeta[m.status];
                  const Icon = milestoneIcon[m.status];
                  return (
                    <StaggerItem key={m.id}>
                      <li className="pl-6 relative">
                        <span
                          className={`absolute -left-[13px] top-1 size-6 rounded-full ring-4 ring-background flex items-center justify-center ${
                            m.status === "COMPLETED"
                              ? "bg-success text-success-foreground"
                              : m.status === "IN_PROGRESS"
                                ? "bg-primary text-primary-foreground"
                                : m.status === "BLOCKED"
                                  ? "bg-destructive text-destructive-foreground"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="size-3.5" />
                        </span>
                        <Card className="p-5">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">{m.title}</h3>
                                <Badge variant={mMeta.variant}>{mMeta.label}</Badge>
                              </div>
                              {m.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {m.description}
                                </p>
                              )}
                              <div className="flex gap-4 flex-wrap mt-2 text-xs text-muted-foreground">
                                {m.dueDate && (
                                  <span>Deadline: {formatDate(m.dueDate)}</span>
                                )}
                                {m.completedAt && (
                                  <span className="text-success">
                                    Selesai: {formatDate(m.completedAt)}
                                  </span>
                                )}
                              </div>
                              {m.requiresClientApproval && m.status === "COMPLETED" && !m.clientApprovedAt && !m.clientRejectedAt && (
                                <MilestoneApproval milestoneId={m.id} />
                              )}
                              {m.clientApprovedAt && (
                                <p className="text-xs text-success mt-2">✓ Disetujui {formatDate(m.clientApprovedAt)}</p>
                              )}
                              {m.clientRejectedAt && (
                                <div className="mt-2 text-xs">
                                  <p className="text-destructive">✗ Ditolak {formatDate(m.clientRejectedAt)}</p>
                                  {m.clientFeedback && <p className="text-muted-foreground mt-1">Feedback: {m.clientFeedback}</p>}
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      </li>
                    </StaggerItem>
                  );
                })}
              </ol>
            </StaggerContainer>
          )}
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
          {project.activities.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground">
              Belum ada aktivitas.
            </Card>
          ) : (
            <div className="relative border-l-2 ml-3 space-y-4 pl-6">
              {project.activities.map((a) => (
                <FadeUp key={a.id}>
                  <div className="relative">
                    <span className="absolute -left-[29px] top-1 size-3 rounded-full bg-primary ring-4 ring-background" />
                    <Card className="p-4">
                      <p className="text-sm">{a.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {a.user?.name} •{" "}
                        {formatDate(a.createdAt, {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </Card>
                  </div>
                </FadeUp>
              ))}
            </div>
          )}
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
          <FileUploader projectId={project.id} />
          {project.files.length === 0 ? (
            <Card className="p-10 text-center text-muted-foreground mt-4">
              Belum ada file.
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              {project.files.map((f) => (
                <Card key={f.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="font-medium truncate mb-1">
                    {f.originalName}
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    {(f.size / 1024).toFixed(1)} KB · {formatDate(f.createdAt)}
                  </div>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <a href={f.url} download={f.originalName}>
                      <Download className="size-3.5" /> Download
                    </a>
                  </Button>
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
                  <Card
                    key={inv.id}
                    className="p-4 flex items-center justify-between gap-3 flex-wrap"
                  >
                    <div>
                      <div className="font-medium">{inv.number}</div>
                      <div className="text-xs text-muted-foreground">
                        Due: {formatDate(inv.dueDate)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant={m.variant}>{m.label}</Badge>
                      <span className="font-semibold">
                        {formatCurrency(Number(inv.total))}
                      </span>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/api/invoices/${inv.id}/pdf`} download>
                          <Download className="size-3.5" /> PDF
                        </a>
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
