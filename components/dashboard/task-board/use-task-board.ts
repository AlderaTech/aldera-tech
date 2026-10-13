"use client";

import * as React from "react";
import {
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { TaskStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  deleteTaskAction,
  reorderProjectTasksAction,
} from "@/lib/actions/task";
import {
  type BoardTask,
  type Columns,
  findTaskStatus,
  makeColumns,
  serializeColumns,
  TASK_STATUSES,
} from "./types";

export function useTaskBoard(projectId: string, tasks: BoardTask[]) {
  const router = useRouter();
  const [boardState, setBoardState] = React.useState(() => ({
    source: tasks,
    columns: makeColumns(tasks),
  }));
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogStatus, setDialogStatus] = React.useState<TaskStatus>("BACKLOG");
  const [editingTask, setEditingTask] = React.useState<BoardTask | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<BoardTask | null>(
    null
  );
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

  function setColumns(nextColumns: Columns) {
    setBoardState({ source: tasks, columns: nextColumns });
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
    const fromIndex = next[fromStatus].findIndex(
      (task) => task.id === activeId
    );
    const [movedTask] = next[fromStatus].splice(fromIndex, 1);
    if (!movedTask) return;

    const overIndex = next[overStatus].findIndex((task) => task.id === overId);
    const targetIndex = overIndex >= 0 ? overIndex : next[overStatus].length;
    next[overStatus].splice(targetIndex, 0, {
      ...movedTask,
      status: overStatus,
    });
    setColumns(next);

    startTransition(async () => {
      const result = await reorderProjectTasksAction(
        projectId,
        serializeColumns(next)
      );
      if (!result.ok) {
        setColumns(previous);
        toast.error(result.message ?? "Gagal mengurutkan task");
      }
    });
  }

  return {
    columns,
    sensors,
    dialogOpen,
    setDialogOpen,
    dialogStatus,
    editingTask,
    deleteTarget,
    setDeleteTarget,
    isPending,
    openCreate,
    openEdit,
    handleDelete,
    handleDragEnd,
    refreshRouter: () => router.refresh(),
  };
}
