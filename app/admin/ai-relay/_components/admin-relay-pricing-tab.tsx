"use client";
import { AdminEmptyState } from "@/app/admin/_components/admin-empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { Edit3, Plus, Search } from "lucide-react";
import type { AdminAiRelayState } from "../_hooks/use-admin-ai-relay";
export function AdminRelayPricingTab({ state }: { state: AdminAiRelayState }) {
  const {
    modelSearch,
    setModelSearch,
    setIsAddModalOpen,
    handleToggleStatus,
    handleOpenEdit,
    filteredPricing,
  } = state;
  return (
    <TabsContent value="pricing" className="space-y-4">
      <Card className="shadow-2xs">
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Katalog & Dynamic Pricing Manager
            </CardTitle>
            <CardDescription className="text-xs">
              Atur harga jual token per 1M (Input/Output dalam IDR), kelola
              status aktifasi, dan pantau estimasi margin kotor terhadap modal
              upstream 9router.
            </CardDescription>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari model..."
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="h-8 bg-primary text-xs text-white hover:bg-primary/90"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Tambah Model
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Model ID</TableHead>
                <TableHead className="text-xs">Nama Display</TableHead>
                <TableHead className="text-right text-xs">
                  Harga Input / 1M
                </TableHead>
                <TableHead className="text-right text-xs">
                  Harga Output / 1M
                </TableHead>
                <TableHead className="text-right text-xs">
                  Estimasi Modal
                </TableHead>
                <TableHead className="text-center text-xs">
                  Gross Margin
                </TableHead>
                <TableHead className="text-center text-xs">Status</TableHead>
                <TableHead className="text-right text-xs">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPricing.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-0">
                    <AdminEmptyState context="models" />
                  </TableCell>
                </TableRow>
              ) : (
                filteredPricing.map((item) => {
                  const avgMargin = item.avg_gross_margin_pct ?? 0;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs font-semibold text-slate-900">
                        {item.model_name}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-700">
                        {item.display_name}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-slate-900">
                        {formatCurrency(item.input_price_per_m)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-slate-900">
                        {formatCurrency(item.output_price_per_m)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-[11px] text-slate-500">
                        {item.upstream_input_cost_per_m
                          ? `${formatCurrency(item.upstream_input_cost_per_m)} / ${formatCurrency(item.upstream_output_cost_per_m || 0)}`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`font-mono text-[11px] ${
                            avgMargin >= 30
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                              : avgMargin >= 10
                                ? "border-amber-300 bg-amber-50 text-amber-700"
                                : "border-rose-300 bg-rose-50 text-rose-700"
                          }`}
                        >
                          {avgMargin > 0 ? `+${avgMargin}%` : `${avgMargin}%`}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={item.is_active}
                            onCheckedChange={() => handleToggleStatus(item)}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(item)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-slate-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
