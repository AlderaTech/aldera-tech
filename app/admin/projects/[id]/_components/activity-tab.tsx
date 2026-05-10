"use client";

import { useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { addActivityNoteAction } from "@/lib/actions/project";

type Activity = {
  id: string;
  action: string;
  description: string;
  createdAt: Date;
  user: { name: string } | null;
};

export function ActivityTab({
  projectId,
  activities,
}: {
  projectId: string;
  activities: Activity[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleAddNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await addActivityNoteAction(projectId, fd);
      if (result?.ok) {
        toast.success("Catatan ditambahkan");
        formRef.current?.reset();
        router.refresh();
      } else {
        toast.error("Gagal");
      }
    });
  }

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-base font-semibold text-slate-950">
            Activity log
          </h2>
          <p className="text-sm text-muted-foreground">
            Tambahkan catatan internal dan pantau riwayat perubahan project.
          </p>
        </div>
        <form ref={formRef} onSubmit={handleAddNote} className="space-y-2">
          <Textarea
            name="note"
            placeholder="Tulis catatan untuk activity log…"
            rows={3}
            required
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} size="sm">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Mengirim…
                </>
              ) : (
                <>
                  <Send className="size-4" /> Tambah Catatan
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {activities.length === 0 ? (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
          Belum ada aktivitas.
        </Card>
      ) : (
        <div className="relative ml-3 space-y-3 border-l-2 border-slate-200 pl-6">
          {activities.map((a) => (
            <div key={a.id} className="relative">
              <span className="absolute -left-[29px] top-1 size-3 rounded-full bg-primary ring-4 ring-background" />
              <Card className="border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{a.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="font-medium">{a.user?.name ?? "System"}</span>
                      <span>•</span>
                      <span>
                        {formatDate(a.createdAt, {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span>•</span>
                      <span className="text-xs uppercase tracking-wide">
                        {a.action.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
