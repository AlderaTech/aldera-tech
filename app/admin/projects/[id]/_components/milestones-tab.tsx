"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, CircleDot, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { MilestoneStatus } from "@prisma/client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { milestoneStatusMeta } from "@/lib/status-meta";
import {
  createMilestoneAction,
  updateMilestoneStatusAction,
  deleteMilestoneAction,
} from "@/lib/actions/project";

type Milestone = {
  id: string;
  title: string;
  description: string | null;
  status: MilestoneStatus;
  dueDate: Date | null;
  completedAt: Date | null;
};

export function MilestonesTab({
  projectId,
  milestones,
}: {
  projectId: string;
  milestones: Milestone[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createMilestoneAction(projectId, fd);
      if (result?.ok) {
        toast.success("Milestone ditambahkan");
        setShowForm(false);
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else {
        toast.error("Gagal menambahkan");
      }
    });
  }

  function handleStatusChange(id: string, status: MilestoneStatus) {
    startTransition(async () => {
      await updateMilestoneStatusAction(id, status);
      toast.success("Status diperbarui");
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Hapus milestone ini?")) return;
    startTransition(async () => {
      await deleteMilestoneAction(id);
      toast.success("Milestone dihapus");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Milestones</h2>
        <Button size="sm" variant="outline" onClick={() => setShowForm((s) => !s)}>
          <Plus className="size-4" />
          {showForm ? "Tutup" : "Tambah Milestone"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid sm:grid-cols-[2fr_1fr] gap-4">
              <div className="space-y-2">
                <Label htmlFor="m-title">Judul</Label>
                <Input id="m-title" name="title" required placeholder="Misal: UI Design" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-due">Target Selesai</Label>
                <Input id="m-due" name="dueDate" type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-desc">Deskripsi (opsional)</Label>
              <Textarea id="m-desc" name="description" rows={2} />
            </div>
            <div className="space-y-2 max-w-xs">
              <Label htmlFor="m-status">Status</Label>
              <Select name="status" defaultValue="PENDING">
                <SelectTrigger id="m-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">Berjalan</SelectItem>
                  <SelectItem value="COMPLETED">Selesai</SelectItem>
                  <SelectItem value="BLOCKED">Terhambat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Menyimpan…
                </>
              ) : (
                "Simpan Milestone"
              )}
            </Button>
          </form>
        </Card>
      )}

      {milestones.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Belum ada milestone.
        </Card>
      ) : (
        <ol className="relative border-l-2 ml-3 space-y-5">
          {milestones.map((m) => {
            const meta = milestoneStatusMeta[m.status];
            return (
              <li key={m.id} className="pl-6 relative">
                <span
                  className={`absolute -left-[9px] top-1 size-4 rounded-full ring-4 ring-background ${
                    m.status === "COMPLETED"
                      ? "bg-success"
                      : m.status === "IN_PROGRESS"
                        ? "bg-primary"
                        : m.status === "BLOCKED"
                          ? "bg-destructive"
                          : "bg-muted-foreground/40"
                  }`}
                />
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{m.title}</h3>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </div>
                      {m.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {m.description}
                        </p>
                      )}
                      <div className="flex gap-4 flex-wrap mt-2 text-xs text-muted-foreground">
                        {m.dueDate && <span>Deadline: {formatDate(m.dueDate)}</span>}
                        {m.completedAt && (
                          <span className="text-success">
                            Selesai: {formatDate(m.completedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {m.status !== "COMPLETED" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleStatusChange(m.id, "COMPLETED")}
                          disabled={isPending}
                          aria-label="Tandai selesai"
                          title="Tandai selesai"
                        >
                          <Check className="size-4 text-success" />
                        </Button>
                      )}
                      {m.status !== "IN_PROGRESS" && m.status !== "COMPLETED" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleStatusChange(m.id, "IN_PROGRESS")}
                          disabled={isPending}
                          aria-label="Mulai"
                          title="Mulai"
                        >
                          <CircleDot className="size-4 text-primary" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(m.id)}
                        disabled={isPending}
                        aria-label="Hapus"
                        title="Hapus"
                      >
                        <X className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
