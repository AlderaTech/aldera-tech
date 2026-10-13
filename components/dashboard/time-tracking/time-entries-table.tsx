"use client";

import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { fmtDuration, type TimeEntryItem } from "./types";

export function TimeEntriesTable({
  entries,
  deleteTarget,
  onSelectDeleteTarget,
  onConfirmDelete,
  isPending,
}: {
  entries: TimeEntryItem[];
  deleteTarget: TimeEntryItem | null;
  onSelectDeleteTarget: (target: TimeEntryItem | null) => void;
  onConfirmDelete: (id: string) => void;
  isPending: boolean;
}) {
  if (entries.length === 0) {
    return (
      <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
        Belum ada time entry.
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden border-slate-200 bg-white p-0 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="hidden md:table-cell">Anggota</TableHead>
              <TableHead className="hidden lg:table-cell">Waktu</TableHead>
              <TableHead className="text-right">Durasi</TableHead>
              <TableHead>Billable</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="max-w-xs truncate">
                  {e.description}
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                  {e.user.name}
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                  {formatDate(e.startedAt, {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {e.endedAt ? fmtDuration(e.durationSec) : "Tidak tersedia"}
                </TableCell>
                <TableCell>
                  <Badge variant={e.billable ? "default" : "outline"}>
                    {e.billable ? "Billable" : "Non-bill"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Hapus"
                    onClick={() => onSelectDeleteTarget(e)}
                    disabled={isPending || !!(e.endedAt === null)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) onSelectDeleteTarget(null);
        }}
        title="Hapus time entry?"
        description={`Entry "${deleteTarget?.description ?? ""}" akan dihapus dari catatan waktu project.`}
        confirmLabel="Hapus entry"
        destructive
        pending={isPending}
        onConfirm={() => {
          if (deleteTarget) onConfirmDelete(deleteTarget.id);
        }}
      />
    </>
  );
}
