"use client";

import * as React from "react";
import { Loader2, RotateCcw, Send, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  markProposalViewedAction,
  rejectProposalAction,
  signProposalAction,
} from "@/lib/actions/proposal";

type Props = {
  token: string;
  disabled: boolean;
};

export function SignaturePanel({ token, disabled }: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [signatureName, setSignatureName] = React.useState("");
  const [accepted, setAccepted] = React.useState(false);
  const [hasInk, setHasInk] = React.useState(false);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<string | null>(null);

  React.useEffect(() => {
    markProposalViewedAction(token);
  }, [token]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * scale);
    canvas.height = Math.floor(rect.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(scale, scale);
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#111827";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, rect.width, rect.height);
  }, []);

  function getPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const point = getPoint(event);
    event.currentTarget.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
    setIsDrawing(true);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing || disabled) return;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const point = getPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    setHasInk(true);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDrawing(false);
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const rect = canvas.getBoundingClientRect();
    context.clearRect(0, 0, rect.width, rect.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, rect.width, rect.height);
    setHasInk(false);
  }

  function handleSign() {
    const canvas = canvasRef.current;
    if (!canvas || !hasInk) {
      toast.error("Tambahkan tanda tangan terlebih dahulu");
      return;
    }
    if (signatureName.trim().length < 2) {
      toast.error("Isi nama penanda tangan");
      return;
    }
    if (!accepted) {
      toast.error("Setujui ketentuan tanda tangan");
      return;
    }

    setPendingAction("sign");
    React.startTransition(async () => {
      const result = await signProposalAction(token, {
        signatureDataUrl: canvas.toDataURL("image/png"),
        signatureName,
      });
      setPendingAction(null);
      if (result.ok) {
        toast.success(result.message);
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleReject() {
    setPendingAction("reject");
    React.startTransition(async () => {
      const result = await rejectProposalAction(token);
      setPendingAction(null);
      if (result.ok) {
        toast.success(result.message);
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    });
  }

  if (disabled) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        Proposal ini tidak dapat ditandatangani lagi.
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold">Tanda Tangan Digital</h2>
        <p className="text-sm text-muted-foreground">
          Tanda tangan akan disimpan bersama waktu, IP, dan browser untuk audit.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="signatureName">Nama Penanda Tangan</Label>
        <Input
          id="signatureName"
          value={signatureName}
          onChange={(event) => setSignatureName(event.target.value)}
          placeholder="Nama lengkap"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label>Signature Pad</Label>
          <Button type="button" size="sm" variant="outline" onClick={clearSignature}>
            <RotateCcw className="size-4" /> Clear
          </Button>
        </div>
        <canvas
          ref={canvasRef}
          className="h-44 w-full touch-none rounded-md border bg-white"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => setIsDrawing(false)}
        />
      </div>
      <label className="flex items-start gap-3 text-sm">
        <Checkbox
          checked={accepted}
          onCheckedChange={(value) => setAccepted(value === true)}
          className="mt-0.5"
        />
        <span>
          Saya menyetujui isi proposal ini dan memahami bahwa tanda tangan
          digital ini menjadi bukti persetujuan.
        </span>
      </label>
      <div className="flex flex-wrap justify-end gap-2">
        <ConfirmDialog
          title="Tolak proposal?"
          description="Proposal akan ditandai sebagai ditolak dan tim Solvo Tech akan melihat status terbaru."
          confirmLabel="Tolak proposal"
          destructive
          pending={pendingAction !== null}
          onConfirm={handleReject}
          trigger={
            <Button
              type="button"
              variant="outline"
              disabled={pendingAction !== null}
            >
              {pendingAction === "reject" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <XCircle className="size-4" />
              )}
              Tolak
            </Button>
          }
        />
        <Button
          type="button"
          onClick={handleSign}
          disabled={pendingAction !== null}
        >
          {pendingAction === "sign" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Setujui & Tanda Tangani
        </Button>
      </div>
    </Card>
  );
}
