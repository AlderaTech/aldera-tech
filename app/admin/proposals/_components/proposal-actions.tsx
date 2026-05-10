"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, ExternalLink, Loader2, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  convertProposalToProjectAction,
  deleteProposalAction,
  sendProposalAction,
} from "@/lib/actions/proposal";
import { isNextNavigationError } from "@/lib/is-next-nav-error";

type Props = {
  proposalId: string;
  publicUrl: string;
  status: string;
  convertedProjectId?: string | null;
};

export function ProposalActions({
  proposalId,
  publicUrl,
  status,
  convertedProjectId,
}: Props) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = React.useState<string | null>(null);

  const isBusy = pendingAction !== null;
  const canSend = status !== "SIGNED" && status !== "CONVERTED";
  const canConvert = status === "SIGNED" && !convertedProjectId;

  function runAction(name: string, action: () => Promise<void>) {
    setPendingAction(name);
    React.startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (error) {
        if (isNextNavigationError(error)) throw error;
        toast.error(error instanceof Error ? error.message : "Aksi gagal");
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleSend() {
    runAction("send", async () => {
      await sendProposalAction(proposalId);
      toast.success("Proposal dikirim");
    });
  }

  function handleCopy() {
    navigator.clipboard
      .writeText(publicUrl)
      .then(() => toast.success("Link disalin"))
      .catch(() => toast.error("Gagal menyalin link"));
  }

  function handleConvert() {
    runAction("convert", async () => {
      const result = await convertProposalToProjectAction(proposalId);
      toast.success("Proposal dikonversi menjadi proyek");
      router.push(`/admin/projects/${result.projectId}`);
    });
  }

  function handleDelete() {
    if (!confirm("Hapus proposal ini?")) return;
    runAction("delete", async () => {
      await deleteProposalAction(proposalId);
      toast.success("Proposal dihapus");
      router.push("/admin/proposals");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" onClick={handleCopy}>
        <Copy className="size-4" /> Copy Link
      </Button>
      <Button asChild type="button" variant="outline">
        <a href={publicUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="size-4" /> Preview
        </a>
      </Button>
      {canSend && (
        <Button type="button" onClick={handleSend} disabled={isBusy}>
          {pendingAction === "send" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Mail className="size-4" />
          )}
          Kirim
        </Button>
      )}
      {canConvert && (
        <Button type="button" onClick={handleConvert} disabled={isBusy}>
          {pendingAction === "convert" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          Convert ke Proyek
        </Button>
      )}
      <Button
        type="button"
        variant="destructive"
        onClick={handleDelete}
        disabled={isBusy}
      >
        {pendingAction === "delete" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
        Hapus
      </Button>
    </div>
  );
}
