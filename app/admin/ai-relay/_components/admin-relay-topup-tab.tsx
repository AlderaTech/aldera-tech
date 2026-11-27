"use client";
import { AdminEmptyState } from "@/app/admin/_components/admin-empty-state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Clock, RefreshCw } from "lucide-react";
import type { AdminAiRelayState } from "../_hooks/use-admin-ai-relay";
export function AdminRelayTopupTab({ state }: { state: AdminAiRelayState }) {
  const {
    pendingTopups,
    setApprovingTicket,
    setRejectingTicket,
    setViewProofTicket,
    refreshFinancialData,
  } = state;
  return (
    <TabsContent value="topup" className="space-y-4">
      <Card className="shadow-2xs">
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Clock className="h-4 w-4 text-amber-600" />
              <span>Antrean Persetujuan Top-up Saldo</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Verifikasi transfer manual QRIS / bank pengguna, cocokkan kode
              unik 3-digit, dan setujui penambahan saldo secara real-time.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshFinancialData}
            className="h-8 text-xs"
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Segarkan Antrean
          </Button>
        </CardHeader>

        <CardContent>
          {pendingTopups.length === 0 ? (
            <AdminEmptyState context="topups" />
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">ID Tiket</TableHead>
                    <TableHead className="text-xs">Pengguna</TableHead>
                    <TableHead className="text-right text-xs">
                      Nominal Pokok
                    </TableHead>
                    <TableHead className="text-center text-xs">
                      Kode Unik
                    </TableHead>
                    <TableHead className="text-right text-xs">
                      Wajib Transfer
                    </TableHead>
                    <TableHead className="text-center text-xs">Bukti</TableHead>
                    <TableHead className="text-xs">Waktu</TableHead>
                    <TableHead className="text-right text-xs">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTopups.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-xs font-bold text-slate-900">
                        #{ticket.id}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="block font-semibold text-slate-900">
                          {ticket.user_name}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {ticket.telegram_id
                            ? `TG: ${ticket.telegram_id}`
                            : ticket.web_user_id
                              ? `Web: ${ticket.web_user_id.slice(0, 10)}...`
                              : `User #${ticket.user_id}`}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-slate-900">
                        {formatCurrency(ticket.amount)}
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs font-bold text-amber-700">
                        +{ticket.unique_code}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-bold text-emerald-700">
                        {formatCurrency(ticket.total_transfer)}
                      </TableCell>
                      <TableCell className="text-center">
                        {ticket.proof_file_id ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewProofTicket(ticket)}
                            className="h-6 px-2 text-[11px] text-primary"
                          >
                            Lihat Bukti
                          </Button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            Belum ada bukti
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-[11px] text-muted-foreground">
                        {formatDate(ticket.created_at, {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => setApprovingTicket(ticket)}
                            className="h-7 bg-emerald-600 px-2.5 text-xs text-white shadow-2xs hover:bg-emerald-700"
                          >
                            Setujui
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRejectingTicket(ticket)}
                            className="h-7 px-2.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          >
                            Tolak
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
