"use client";

import * as React from "react";
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TaskPriority, TaskStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  Calendar,
  GripVertical,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createTaskAction,
  deleteTaskAction,
  reorderProjectTasksAction,
  type TaskActionState,
  updateTaskAction,
} from "@/lib/actions/task";
import { taskPriorityMeta, taskStatusMeta } from "@/lib/status-meta";
import { cn, formatDate, getInitials } from "@/lib/utils";

const TASK_STATUSES: TaskStatus[] = [
  "BACKLOG",
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
];

const TASK_PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export type BoardTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
  dueDate: Date | null;
  completedAt: Date | null;
  assigneeId: string | null;
  assignee: { id: string; name: string } | null;
  milestoneId: string | null;
  milestone: { id: string; title: string } | null;
};

type Option = { id: string; name: string };
type MilestoneOption = { id: string; title: string };
type Columns = Record<TaskStatus, BoardTask[]>;

function makeColumns(tasks: BoardTask[]): Columns {
  return TASK_STATUSES.reduce((acc, status) => {
    acc[status] = tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.order - b.order);
    return acc;
  }, {} as Columns);
}

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function TaskFormDialog({
  open,
  onOpenChange,
  projectId,
  task,
  defaultStatus,
  milestones,
  assignees,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  task?: BoardTask | null;
  defaultStatus: TaskStatus;
  milestones: MilestoneOption[];
  assignees: Option[];
  onSaved: () => void;
}) {
  const [isPending, startTransition] = React.useTransition();
  const isEditing = Boolean(task);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const empty: TaskActionState = { ok: false };
      const result = task
        ? await updateTaskAction(task.id, empty, formData)
        : await createTaskAction(projectId, empty, formData);
      if (result.ok) {
        toast.success(result.message ?? "Task disimpan");
        onOpenChange(false);
        onSaved();
      } else {
        toast.error(result.message ?? "Gagal menyimpan task");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Task Baru"}</DialogTitle>
          <DialogDescription>
            Lengkapi detail task untuk board proyek ini.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Judul</Label>
            <Input
              id="task-title"
              name="title"
              defaultValue={task?.title ?? ""}
              placeholder="Judul task"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-description">Deskripsi</Label>
            <Textarea
              id="task-description"
              name="description"
              rows={3}
              defaultValue={task?.description ?? ""}
              placeholder="Detail pekerjaan atau acceptance criteria"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select name="status" defaultValue={task?.status ?? defaultStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status task" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {taskStatusMeta[status].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prioritas</Label>
              <Select name="priority" defaultValue={task?.priority ?? "MEDIUM"}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih prioritas task" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {taskPriorityMeta[priority].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due">Deadline</Label>
              <Input
                id="task-due"
                name="dueDate"
                type="date"
                defaultValue={toDateInputValue(task?.dueDate ?? null)}
                placeholder="Pilih deadline task"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select name="assigneeId" defaultValue={task?.assigneeId ?? "none"}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada</SelectItem>
                  {assignees.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      {assignee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Milestone</Label>
              <Select name="milestoneId" defaultValue={task?.milestoneId ?? "none"}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih milestone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tidak ada</SelectItem>
                  {milestones.map((milestone) => (
                    <SelectItem key={milestone.id} value={milestone.id}>
                      {milestone.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TaskCard({
  task,
  readOnly,
  onEdit,
  onDelete,
}: {
  task: BoardTask;
  readOnly: boolean;
  onEdit: (task: BoardTask) => void;
  onDelete: (taskId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: readOnly });
  const priority = taskPriorityMeta[task.priority];

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "border-slate-200 bg-white p-3 shadow-xs transition-shadow",
        isDragging && "opacity-70 shadow-lg"
      )}
    >
      <div className="flex items-start gap-2">
        {!readOnly && (
          <button
            type="button"
            className="mt-0.5 cursor-grab rounded p-1 text-muted-foreground hover:bg-accent active:cursor-grabbing"
            aria-label="Drag task"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold leading-snug">{task.title}</h3>
            {!readOnly && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7 shrink-0">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Pencil className="size-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(task.id)}
                  >
                    <Trash2 className="size-4" /> Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {task.description && (
            <p className="line-clamp-3 text-xs text-muted-foreground">
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={priority.variant}>{priority.label}</Badge>
            {task.milestone && (
              <Badge variant="outline">{task.milestone.title}</Badge>
            )}
          </div>
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            {task.dueDate ? (
              <span className="inline-flex items-center gap-1">
                <Calendar className="size-3" />
                {formatDate(task.dueDate)}
              </span>
            ) : (
              <span />
            )}
            {task.assignee && (
              <span className="inline-flex items-center gap-1.5">
                <Avatar className="size-5">
                  <AvatarFallback className="text-[10px]">
                    {getInitials(task.assignee.name)}
                  </AvatarFallback>
                </Avatar>
                {task.assignee.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function DroppableColumn({
  id,
  children,
}: {
  id: TaskStatus;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className="min-h-72 rounded-xl border border-slate-200 bg-slate-50/70 p-3"
    >
      {children}
    </div>
  );
}

function findTaskStatus(columns: Columns, taskId: string) {
  return TASK_STATUSES.find((status) =>
    columns[status].some((task) => task.id === taskId)
  );
}

function serializeColumns(columns: Columns) {
  return TASK_STATUSES.reduce(
    (acc, status) => {
      acc[status] = columns[status].map((task) => task.id);
      return acc;
    },
    {} as Record<TaskStatus, string[]>
  );
}

export function ProjectTaskBoard({
  projectId,
  tasks,
  milestones,
  assignees,
  readOnly = false,
}: {
  projectId: string;
  tasks: BoardTask[];
  milestones: MilestoneOption[];
  assignees: Option[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [boardState, setBoardState] = React.useState(() => ({
    source: tasks,
    columns: makeColumns(tasks),
  }));
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogStatus, setDialogStatus] = React.useState<TaskStatus>("BACKLOG");
  const [editingTask, setEditingTask] = React.useState<BoardTask | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<BoardTask | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (boardState.source !== tasks) {
    setBoardState({ source: tasks, columns: makeColumns(tasks) });
  }

  const columns =
    boardState.source === tasks ? boardState.columns : makeColumns(tasks);

  function setColumns(columns: Columns) {
    setBoardState({ source: tasks, columns });
  }

  function openCreate(status: TaskStatus) {
    setDialogStatus(status);
    setEditingTask(null);
    setDialogOpen(true);
  }

  function openEdit(task: BoardTask) {
    setDialogStatus(task.status);
    setEditingTask(task);
    setDialogOpen(true);
  }

  function handleDelete(taskId: string) {
    startTransition(async () => {
      await deleteTaskAction(taskId);
      toast.success("Task dihapus");
      setDeleteTarget(null);
      router.refresh();
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const fromStatus = findTaskStatus(columns, activeId);
    const overStatus = TASK_STATUSES.includes(overId as TaskStatus)
      ? (overId as TaskStatus)
      : findTaskStatus(columns, overId);
    if (!fromStatus || !overStatus) return;

    const previous = columns;
    const next: Columns = {
      BACKLOG: [...columns.BACKLOG],
      TODO: [...columns.TODO],
      IN_PROGRESS: [...columns.IN_PROGRESS],
      REVIEW: [...columns.REVIEW],
      DONE: [...columns.DONE],
    };
    const fromIndex = next[fromStatus].findIndex((task) => task.id === activeId);
    const [movedTask] = next[fromStatus].splice(fromIndex, 1);
    if (!movedTask) return;

    const overIndex = next[overStatus].findIndex((task) => task.id === overId);
    const targetIndex = overIndex >= 0 ? overIndex : next[overStatus].length;
    next[overStatus].splice(targetIndex, 0, { ...movedTask, status: overStatus });
    setColumns(next);

    startTransition(async () => {
      const result = await reorderProjectTasksAction(projectId, serializeColumns(next));
      if (!result.ok) {
        setColumns(previous);
        toast.error(result.message ?? "Gagal mengurutkan task");
      }
    });
  }

  const board = (
    <div className="grid gap-3 xl:grid-cols-5">
      {TASK_STATUSES.map((status) => {
        const meta = taskStatusMeta[status];
        const taskIds = columns[status].map((task) => task.id);
        return (
          <DroppableColumn key={status} id={status}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={meta.variant}>{meta.label}</Badge>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {columns[status].length}
                </span>
              </div>
              {!readOnly && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => openCreate(status)}
                  aria-label={`Tambah task ${meta.label}`}
                >
                  <Plus className="size-4" />
                </Button>
              )}
            </div>
            <SortableContext
              items={taskIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2.5">
                {columns[status].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    readOnly={readOnly}
                    onEdit={openEdit}
                    onDelete={() => setDeleteTarget(task)}
                  />
                ))}
                {columns[status].length === 0 && (
                  <div className="rounded-lg border border-dashed bg-white/70 p-5 text-center text-xs text-muted-foreground">
                    Belum ada task.
                  </div>
                )}
              </div>
            </SortableContext>
          </DroppableColumn>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Kanban task board
          </h2>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? "Pantau status task proyek."
              : "Kelola task proyek dengan drag-and-drop."}
          </p>
        </div>
        {!readOnly && (
          <Button type="button" onClick={() => openCreate("BACKLOG")}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Task Baru
          </Button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={readOnly ? undefined : handleDragEnd}
      >
        {board}
      </DndContext>

      {!readOnly && (
        <TaskFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          projectId={projectId}
          task={editingTask}
          defaultStatus={dialogStatus}
          milestones={milestones}
          assignees={assignees}
          onSaved={() => router.refresh()}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Hapus task?"
        description={`Task "${deleteTarget?.title ?? ""}" akan dihapus dari board project.`}
        confirmLabel="Hapus task"
        destructive
        pending={isPending}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget.id);
        }}
      />
    </div>
  );
}
