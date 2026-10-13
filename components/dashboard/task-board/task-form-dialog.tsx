"use client";

import * as React from "react";
import type { TaskStatus } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  type TaskActionState,
  updateTaskAction,
} from "@/lib/actions/task";
import { taskPriorityMeta, taskStatusMeta } from "@/lib/status-meta";
import {
  type BoardTask,
  type MilestoneOption,
  type Option,
  TASK_PRIORITIES,
  TASK_STATUSES,
  toDateInputValue,
} from "./types";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  task?: BoardTask | null;
  defaultStatus: TaskStatus;
  milestones: MilestoneOption[];
  assignees: Option[];
  onSaved: () => void;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  projectId,
  task,
  defaultStatus,
  milestones,
  assignees,
  onSaved,
}: TaskFormDialogProps) {
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
              <Select
                name="status"
                defaultValue={task?.status ?? defaultStatus}
              >
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
              <Select
                name="assigneeId"
                defaultValue={task?.assigneeId ?? "none"}
              >
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
              <Select
                name="milestoneId"
                defaultValue={task?.milestoneId ?? "none"}
              >
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
