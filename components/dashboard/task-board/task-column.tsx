"use client";

import * as React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { TaskStatus } from "@prisma/client";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { taskStatusMeta } from "@/lib/status-meta";
import { TaskCard } from "./task-card";
import type { BoardTask } from "./types";

interface TaskColumnProps {
  status: TaskStatus;
  tasks: BoardTask[];
  readOnly: boolean;
  onOpenCreate: (status: TaskStatus) => void;
  onEdit: (task: BoardTask) => void;
  onDeleteTarget: (task: BoardTask) => void;
}

export function TaskColumn({
  status,
  tasks,
  readOnly,
  onOpenCreate,
  onEdit,
  onDeleteTarget,
}: TaskColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });
  const meta = taskStatusMeta[status];
  const taskIds = React.useMemo(() => tasks.map((t) => t.id), [tasks]);

  return (
    <div
      ref={setNodeRef}
      className="min-h-72 rounded-xl border border-slate-200 bg-slate-50/70 p-3"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant={meta.variant}>{meta.label}</Badge>
          <span className="text-xs text-muted-foreground tabular-nums">
            {tasks.length}
          </span>
        </div>
        {!readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onOpenCreate(status)}
            aria-label={`Tambah task ${meta.label}`}
          >
            <Plus className="size-4" />
          </Button>
        )}
      </div>

      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              readOnly={readOnly}
              onEdit={onEdit}
              onDelete={() => onDeleteTarget(task)}
            />
          ))}
          {tasks.length === 0 && (
            <div className="rounded-lg border border-dashed bg-white/70 p-5 text-center text-xs text-muted-foreground">
              Belum ada task.
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
