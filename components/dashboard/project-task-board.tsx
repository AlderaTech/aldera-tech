"use client";

import * as React from "react";
import { closestCorners, DndContext } from "@dnd-kit/core";
import { Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  type BoardTask,
  type MilestoneOption,
  type Option,
  TASK_STATUSES,
} from "./task-board/types";
import { TaskColumn } from "./task-board/task-column";
import { TaskFormDialog } from "./task-board/task-form-dialog";
import { useTaskBoard } from "./task-board/use-task-board";

export type { BoardTask };

interface ProjectTaskBoardProps {
  projectId: string;
  tasks: BoardTask[];
  milestones: MilestoneOption[];
  assignees: Option[];
  readOnly?: boolean;
}

export function ProjectTaskBoard({
  projectId,
  tasks,
  milestones,
  assignees,
  readOnly = false,
}: ProjectTaskBoardProps) {
  const {
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
    refreshRouter,
  } = useTaskBoard(projectId, tasks);

  return (
    <div className="space-y-4 rounded-[1.4rem] border border-[#e1e8f2] bg-white p-5 shadow-[0_4px_16px_rgb(16_38_81/5%)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e1e8f2] pb-3.5">
        <div>
          <p className="m-0 text-[11px] font-extrabold tracking-[0.12em] text-[#65748b] uppercase">
            Manajemen Tugas
          </p>
          <h2 className="mt-1 text-base font-extrabold tracking-[-0.03em] text-[#102651]">
            Kanban task board
          </h2>
          <p className="mt-0.5 text-xs text-[#65748b]">
            {readOnly
              ? "Pantau status task proyek secara real-time."
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
        <div className="grid gap-3 xl:grid-cols-5">
          {TASK_STATUSES.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={columns[status]}
              readOnly={readOnly}
              onOpenCreate={openCreate}
              onEdit={openEdit}
              onDeleteTarget={(task) => setDeleteTarget(task)}
            />
          ))}
        </div>
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
          onSaved={refreshRouter}
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
