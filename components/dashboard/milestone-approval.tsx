"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { approveMilestoneAction, rejectMilestoneAction } from "@/lib/actions/milestone";

export function MilestoneApproval({ milestoneId }: { milestoneId: string }) {
  const router = useRouter();
  const [showReject, setShowReject] = React.useState(false);
  const [feedback, setFeedback] = React.useState("");
  const [loading, setLoading] = React.useState<"approve" | "reject" | null>(null);

  async function handleApprove() {
    setLoading("approve");
    try {
      await approveMilestoneAction(milestoneId);
      toast.success("Milestone disetujui");
      router.refresh();
    } catch {
      toast.error("Gagal menyetujui milestone");
    } finally {
      setLoading(null);
    }
  }

  async function handleReject() {
    setLoading("reject");
    try {
      await rejectMilestoneAction(milestoneId, feedback);
      toast.success("Feedback terkirim");
      setShowReject(false);
      router.refresh();
    } catch {
      toast.error("Gagal mengirim feedback");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium text-amber-600">
        ⏳ Menunggu persetujuan Anda
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleApprove} disabled={!!loading}>
          {loading === "approve" ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
          Setujui
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowReject(!showReject)} disabled={!!loading}>
          <XCircle className="size-3.5" /> Tolak
        </Button>
      </div>
      {showReject && (
        <div className="space-y-2">
          <Textarea
            placeholder="Berikan feedback (opsional)..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={2}
          />
          <Button size="sm" variant="destructive" onClick={handleReject} disabled={!!loading}>
            {loading === "reject" && <Loader2 className="size-3.5 animate-spin" />}
            Kirim Penolakan
          </Button>
        </div>
      )}
    </div>
  );
}
