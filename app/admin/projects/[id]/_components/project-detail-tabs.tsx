"use client";

import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  MessageSquare,
  Timer,
} from "lucide-react";
import type { Session } from "next-auth";

import { FileUploader } from "@/components/dashboard/file-uploader";
import { MessagesTab } from "@/components/dashboard/messages-tab";
import { ProjectTaskBoard } from "@/components/dashboard/project-task-board";
import { TimeTab } from "@/components/dashboard/time-tab";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUrlState } from "@/lib/hooks/use-url-state";
import { isStaff } from "@/lib/permissions";
import { ADMIN_ROUTES } from "@/lib/routes";
import { invoiceStatusMeta } from "@/lib/status-meta";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ActivityTab } from "./activity-tab";
import { MilestonesTab } from "./milestones-tab";
import { ProjectOverviewTab } from "./overview-tab";
import type { AdminProjectDetail } from "../_data/project-detail";

const ALLOWED_TABS = [
  "overview",
  "milestones",
  "tasks",
  "activity",
  "messages",
  "time",
  "files",
  "invoices",
] as const;

type ProjectTab = (typeof ALLOWED_TABS)[number];

export function ProjectDetailTabs({
  project,
  session,
}: {
  project: AdminProjectDetail;
  session: Session | null;
}) {
  const { getParam, setParam } = useUrlState();
  const tabParam = getParam("tab", "overview");
  const currentTab = ALLOWED_TABS.includes(tabParam as ProjectTab)
    ? tabParam
    : "overview";

  const activeMessages = project.messages.filter(
    (message) => !message.deletedAt
  );

  return (
    <Tabs
      value={currentTab}
      onValueChange={(val) => setParam("tab", val)}
      className="gap-0"
    >
      <div className="sticky top-16 z-20 -mx-1 overflow-x-auto border-b border-slate-200 bg-slate-50/95 px-1 py-2 backdrop-blur">
        <TabsList className="h-auto w-max justify-start gap-1 bg-white p-1 shadow-sm">
          <ProjectTabTrigger
            value="overview"
            icon={FolderOpen}
            label="Overview"
          />
          <ProjectTabTrigger
            value="milestones"
            icon={CheckCircle2}
            label="Milestones"
            count={project.milestones.length}
          />
          <ProjectTabTrigger
            value="tasks"
            icon={Clock3}
            label="Tasks"
            count={project.tasks.length}
          />
          <ProjectTabTrigger
            value="activity"
            icon={Activity}
            label="Activity"
            count={project.activities.length}
          />
          <ProjectTabTrigger
            value="messages"
            icon={MessageSquare}
            label="Diskusi"
            count={activeMessages.length}
          />
          <ProjectTabTrigger
            value="time"
            icon={Timer}
            label="Time"
            count={project.timeEntries.length}
          />
          <ProjectTabTrigger
            value="files"
            icon={FolderOpen}
            label="Files"
            count={project.files.length}
          />
          <ProjectTabTrigger
            value="invoices"
            icon={FileText}
            label="Invoices"
            count={project.invoices.length}
          />
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
        <ActivityTab projectId={project.id} activities={project.activities} />
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
        <ProjectFilesPanel project={project} />
      </TabsContent>

      <TabsContent value="invoices" className="mt-4">
        <ProjectInvoicesPanel project={project} />
      </TabsContent>
    </Tabs>
  );
}

function ProjectTabTrigger({
  value,
  icon: Icon,
  label,
  count,
}: {
  value: string;
  icon: typeof FolderOpen;
  label: string;
  count?: number;
}) {
  return (
    <TabsTrigger value={value} className="gap-2">
      <Icon className="size-4" />
      {label}
      {count !== undefined && (
        <span className="rounded bg-slate-100 px-1.5 text-xs">{count}</span>
      )}
    </TabsTrigger>
  );
}

function ProjectFilesPanel({ project }: { project: AdminProjectDetail }) {
  return (
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
          {project.files.map((file) => (
            <Card
              key={file.id}
              className="border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="truncate font-medium">{file.originalName}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB · {file.mimeType}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatDate(file.createdAt)}
                </div>
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectInvoicesPanel({ project }: { project: AdminProjectDetail }) {
  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold">Invoice proyek</h2>
          <p className="text-sm text-muted-foreground">
            Pantau tagihan yang terhubung dengan project ini.
          </p>
        </div>
        <Button asChild>
          <Link href={ADMIN_ROUTES.invoiceNew}>
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
          {project.invoices.map((invoice) => {
            const meta = invoiceStatusMeta[invoice.status];
            return (
              <Link
                key={invoice.id}
                href={ADMIN_ROUTES.invoiceDetail(invoice.id)}
              >
                <Card className="flex flex-wrap items-center justify-between gap-3 border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                  <div>
                    <div className="font-medium">{invoice.number}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      Issued: {formatDate(invoice.issueDate)} · Due:{" "}
                      {formatDate(invoice.dueDate)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {formatCurrency(Number(invoice.total))}
                    </span>
                    <Badge variant={meta.variant}>{meta.label}</Badge>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
