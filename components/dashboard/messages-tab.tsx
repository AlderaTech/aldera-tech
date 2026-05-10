"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send, Trash2, MoreHorizontal, Pencil } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  postMessageAction,
  editMessageAction,
  deleteMessageAction,
} from "@/lib/actions/message";
import { formatDate, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type MessageItem = {
  id: string;
  content: string;
  createdAt: Date;
  editedAt: Date | null;
  deletedAt: Date | null;
  parentId: string | null;
  author: { id: string; name: string; role: string } | null;
};

export function MessagesTab({
  projectId,
  messages,
  currentUserId,
  isStaff,
}: {
  projectId: string;
  messages: MessageItem[];
  currentUserId: string;
  isStaff: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = React.useState("");
  const [parentId, setParentId] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  // Group messages into threads: top-level + replies under each
  const topLevel = messages.filter((m) => !m.parentId);
  const repliesByParent = messages.reduce<Record<string, MessageItem[]>>(
    (acc, m) => {
      if (m.parentId) (acc[m.parentId] ??= []).push(m);
      return acc;
    },
    {}
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) return;
    const fd = new FormData();
    fd.set("content", content);
    if (parentId) fd.set("parentId", parentId);
    startTransition(async () => {
      const r = await postMessageAction(projectId, fd);
      if (r.ok) {
        setContent("");
        setParentId(null);
        router.refresh();
      } else {
        toast.error(r.error ?? "Gagal");
      }
    });
  }

  const replyTarget = parentId
    ? messages.find((m) => m.id === parentId)
    : null;

  return (
    <div className="max-w-4xl space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">
          Diskusi proyek
        </h2>
        <p className="text-sm text-muted-foreground">
          Komunikasi terpusat antara tim dan client, semua riwayat tersimpan.
        </p>
      </div>

      <Card className="space-y-3 border-slate-200 bg-white p-4 shadow-sm">
        {replyTarget && (
          <div className="text-xs bg-muted/50 rounded px-3 py-2 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-muted-foreground">Membalas </span>
              <span className="font-medium">{replyTarget.author?.name}</span>
              <div className="text-muted-foreground line-clamp-1 italic">
                &ldquo;{replyTarget.content}&rdquo;
              </div>
            </div>
            <button
              type="button"
              onClick={() => setParentId(null)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Batal balas"
            >
              ✕
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            placeholder="Tulis pesan…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || !content.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Mengirim…
                </>
              ) : (
                <>
                  <Send className="size-4" /> Kirim
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {topLevel.length === 0 ? (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
          Belum ada pesan. Mulai diskusi di atas.
        </Card>
      ) : (
        <div className="space-y-3">
          {topLevel
            .slice()
            .reverse()
            .map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                replies={repliesByParent[m.id] ?? []}
                currentUserId={currentUserId}
                isStaff={isStaff}
                onReply={setParentId}
                onRefresh={() => router.refresh()}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  replies,
  currentUserId,
  isStaff,
  onReply,
  onRefresh,
}: {
  message: MessageItem;
  replies: MessageItem[];
  currentUserId: string;
  isStaff: boolean;
  onReply: (id: string) => void;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(message.content);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const canEdit =
    !message.deletedAt && (message.author?.id === currentUserId || isStaff);

  function save() {
    startTransition(async () => {
      try {
        await editMessageAction(message.id, draft);
        toast.success("Pesan diperbarui");
        setEditing(false);
        onRefresh();
      } catch {
        toast.error("Gagal");
      }
    });
  }

  function del() {
    startTransition(async () => {
      try {
        await deleteMessageAction(message.id);
        toast.success("Pesan dihapus");
        setConfirmOpen(false);
        onRefresh();
      } catch {
        toast.error("Gagal");
      }
    });
  }

  const staffRole = message.author?.role !== "CLIENT";

  return (
    <Card className="border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar className="size-8">
          <AvatarFallback
            className={cn(
              "text-xs",
              staffRole
                ? "bg-primary/10 text-primary"
                : "bg-chart-2/10 text-chart-2"
            )}
          >
            {getInitials(message.author?.name ?? "U")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {message.author?.name ?? "Unknown"}
            </span>
            {staffRole && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                Tim
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDate(message.createdAt, {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {message.editedAt && " · diedit"}
            </span>
          </div>
          {editing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder="Edit isi pesan"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={save} disabled={isPending}>
                  Simpan
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDraft(message.content);
                    setEditing(false);
                  }}
                >
                  Batal
                </Button>
              </div>
            </div>
          ) : (
            <p
              className={cn(
                "text-sm mt-1 whitespace-pre-wrap break-words",
                message.deletedAt && "italic text-muted-foreground"
              )}
            >
              {message.content}
            </p>
          )}

          {!message.deletedAt && !editing && (
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => onReply(message.id)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Balas
              </button>
            </div>
          )}
        </div>
        {canEdit && !editing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-7 shrink-0"
                aria-label="Menu"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(true)}>
                <Pencil className="size-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onSelect={(event) => {
                  event.preventDefault();
                  setConfirmOpen(true);
                }}
              >
                <Trash2 className="size-4" /> Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {replies.length > 0 && (
        <div className="mt-3 ml-3 space-y-3 border-l-2 border-slate-200 pl-8">
          {replies.map((r) => (
            <MessageBubble
              key={r.id}
              message={r}
              replies={[]}
              currentUserId={currentUserId}
              isStaff={isStaff}
              onReply={onReply}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus pesan?"
        description="Pesan akan ditandai sebagai dihapus agar struktur diskusi tetap utuh."
        confirmLabel="Hapus pesan"
        destructive
        pending={isPending}
        onConfirm={del}
      />
    </Card>
  );
}
