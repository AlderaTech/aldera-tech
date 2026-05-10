"use client";
"use client";

import * as React from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteProjectAction,
  updateProjectAction,
  type ProjectActionState,
} from "@/lib/actions/project";
import { isNextNavigationError } from "@/lib/is-next-nav-error";
import { cn } from "@/lib/utils";

type Props = {
  project: {
    id: string;
    title: string;
    description: string;
    status: string;
    progress: number;
    autoProgress: boolean;
    deadline: Date | null;
    budget: string | null;
  };
};

export function ProjectOverviewTab({ project }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [autoProgress, setAutoProgress] = React.useState(project.autoProgress);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const empty: ProjectActionState = { ok: false };
      const result = await updateProjectAction(project.id, empty, fd);
      if (result.ok) {
        toast.success(result.message ?? "Tersimpan");
        router.refresh();
      } else {
        toast.error(result.message ?? "Gagal");
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Hapus proyek "${project.title}"? Ini tidak bisa di-undo.`)) return;
    startTransition(async () => {
      try {
        await deleteProjectAction(project.id);
      } catch (err) {
        if (isNextNavigationError(err)) throw err;
        toast.error("Gagal menghapus");
      }
    });
  }

  const deadlineValue = project.deadline
    ? new Date(project.deadline).toISOString().slice(0, 10)
    : "";

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card className="p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Judul</Label>
          <Input id="title" name="title" defaultValue={project.title} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={project.description}
            required
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={project.status}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">Berjalan</SelectItem>
                <SelectItem value="REVIEW">Review</SelectItem>
                <SelectItem value="COMPLETED">Selesai</SelectItem>
                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="progress">Progres (%)</Label>
            <Input
              id="progress"
              name="progress"
              type="number"
              min={0}
              max={100}
              defaultValue={project.progress}
              disabled={autoProgress}
              className={cn(autoProgress && "opacity-50")}
            />
            <input type="hidden" name="autoProgress" value={autoProgress ? "true" : "false"} />
            <button
              type="button"
              onClick={() => setAutoProgress((p) => !p)}
              className={cn(
                "flex items-center gap-2 text-xs px-2.5 py-1 rounded-md border transition-colors w-fit",
                autoProgress
                  ? "bg-primary/10 border-primary/50 text-primary"
                  : "hover:bg-accent"
              )}
            >
              <Sparkles className={cn("size-3.5", autoProgress && "text-primary")} />
              Auto dari milestone
              <span
                className={cn(
                  "ml-1 inline-flex h-3 w-6 items-center rounded-full transition-colors",
                  autoProgress ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "inline-block size-2.5 rounded-full bg-background transition-transform",
                    autoProgress ? "translate-x-3" : "translate-x-0.5"
                  )}
                />
              </span>
            </button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              defaultValue={deadlineValue}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget">Budget (IDR)</Label>
            <Input
              id="budget"
              name="budget"
              type="number"
              defaultValue={project.budget ?? ""}
            />
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Button
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="size-4" /> Hapus Proyek
        </Button>
        <Button type="submit" disabled={isPending} size="lg">
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Menyimpan…
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </div>
    </form>
  );
}
