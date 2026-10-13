"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { taskPriorityMeta } from "@/lib/status-meta";
import { cn, formatDate, getInitials } from "@/lib/utils";
import type { BoardTask } from "./types";

interface TaskCardProps {
  task: BoardTask;
  readOnly: boolean;
  onEdit: (task: BoardTask) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, readOnly, onEdit, onDelete }: TaskCardProps) {
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
            <h3 className="text-sm leading-snug font-semibold">{task.title}</h3>
            {!readOnly && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                  >
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
