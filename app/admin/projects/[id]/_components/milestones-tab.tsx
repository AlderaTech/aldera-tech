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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
} from "@/lib/actions/milestone";

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
    startTransition(async () => {
      await deleteMilestoneAction(id);
      toast.success("Milestone dihapus");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Milestones</h2>
          <p className="text-sm text-muted-foreground">
            Pecah project menjadi target delivery yang bisa dipantau.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowForm((s) => !s)}
        >
          <Plus className="size-4" />
          {showForm ? "Tutup" : "Tambah Milestone"}
        </Button>
      </div>

      {showForm && (
        <Card className="border-slate-200 bg-white p-4 shadow-sm">
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
              <div className="space-y-1.5">
                <Label htmlFor="m-title">Judul</Label>
                <Input
                  id="m-title"
                  name="title"
                  required
                  placeholder="Misal: UI Design"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-due">Target Selesai</Label>
                <Input
                  id="m-due"
                  name="dueDate"
                  type="date"
                  placeholder="Pilih target selesai"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-status">Status</Label>
                <Select name="status" defaultValue="PENDING">
                  <SelectTrigger id="m-status">
                    <SelectValue placeholder="Pilih status milestone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">Berjalan</SelectItem>
                    <SelectItem value="COMPLETED">Selesai</SelectItem>
                    <SelectItem value="BLOCKED">Terhambat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-desc">Deskripsi (opsional)</Label>
              <Textarea
                id="m-desc"
                name="description"
                rows={2}
                placeholder="Catatan singkat tentang milestone"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Menyimpan…
                  </>
                ) : (
                  "Simpan Milestone"
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {milestones.length === 0 ? (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
          Belum ada milestone.
        </Card>
      ) : (
        <ol className="relative ml-3 space-y-3 border-l-2 border-slate-200">
          {milestones.map((m) => {
            const meta = milestoneStatusMeta[m.status];
            return (
              <li key={m.id} className="relative pl-6">
                <span
                  className={`absolute top-1 -left-[9px] size-4 rounded-full ring-4 ring-background ${
                    m.status === "COMPLETED"
                      ? "bg-success"
                      : m.status === "IN_PROGRESS"
                        ? "bg-primary"
                        : m.status === "BLOCKED"
                          ? "bg-destructive"
                          : "bg-muted-foreground/40"
                  }`}
                />
                <Card className="border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{m.title}</h3>
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                      </div>
                      {m.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {m.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        {m.dueDate && (
                          <span>Deadline: {formatDate(m.dueDate)}</span>
                        )}
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
                      {m.status !== "IN_PROGRESS" &&
                        m.status !== "COMPLETED" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              handleStatusChange(m.id, "IN_PROGRESS")
                            }
                            disabled={isPending}
                            aria-label="Mulai"
                            title="Mulai"
                          >
                            <CircleDot className="size-4 text-primary" />
                          </Button>
                        )}
                      <ConfirmDialog
                        title="Hapus milestone?"
                        description={`Milestone "${m.title}" akan dihapus dari project ini.`}
                        confirmLabel="Hapus milestone"
                        destructive
                        pending={isPending}
                        onConfirm={() => handleDelete(m.id)}
                        trigger={
                          <Button
                            size="icon"
                            variant="ghost"
                            disabled={isPending}
                            aria-label="Hapus"
                            title="Hapus"
                          >
                            <X className="size-4 text-destructive" />
                          </Button>
                        }
                      />
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
