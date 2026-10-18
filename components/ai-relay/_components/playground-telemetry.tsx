import { Coins, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type {
  ModelCatalogItem,
  PlaygroundChatResult,
} from "@/lib/actions/ai-relay";
export function PlaygroundTelemetry({
  currentModelMeta,
  lastUsage,
  lastDuration,
  currentBalance,
}: {
  currentModelMeta?: ModelCatalogItem;
  lastUsage: PlaygroundChatResult["usage"] | null;
  lastDuration: number | null;
  currentBalance: number;
}) {
  return (
    <div className="space-y-4">
      {/* Model Card */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            Model Terpilih
          </CardTitle>
          <div className="flex items-center justify-between pt-1">
            <span className="truncate text-sm font-bold text-slate-900">
              {currentModelMeta?.displayName}
            </span>
            <Badge variant="outline" className="text-[10px]">
              {currentModelMeta?.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-1 text-xs">
          <div className="flex justify-between border-b pb-1.5">
            <span className="text-slate-500">Harga Input:</span>
            <span className="font-mono font-medium">
              {formatCurrency(currentModelMeta?.inputPricePerM || 0)} / 1M
            </span>
          </div>
          <div className="flex justify-between border-b pb-1.5">
            <span className="text-slate-500">Harga Output:</span>
            <span className="font-mono font-medium">
              {formatCurrency(currentModelMeta?.outputPricePerM || 0)} / 1M
            </span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-slate-500">Konteks:</span>
            <span className="font-mono">
              {(currentModelMeta?.contextWindow || 0).toLocaleString("id-ID")}{" "}
              token
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Live Token & Cost Telemetry */}
      <Card className="border bg-slate-50/50 shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Telemetri Permintaan Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {lastUsage ? (
            <>
              <div className="flex justify-between">
                <span className="text-slate-600">Prompt Tokens:</span>
                <span className="font-mono font-bold text-indigo-700">
                  {lastUsage.promptTokens}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Completion Tokens:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {lastUsage.completionTokens}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Tokens:</span>
                <span className="font-mono font-bold text-slate-900">
                  {lastUsage.totalTokens}
                </span>
              </div>
              <div className="flex justify-between border-t pt-1.5">
                <span className="text-slate-600">Durasi Response:</span>
                <span className="font-mono">{lastDuration} ms</span>
              </div>
              <div className="flex items-baseline justify-between border-t pt-2">
                <span className="font-semibold text-slate-900">
                  Biaya Terdebit:
                </span>
                <span className="font-mono text-sm font-extrabold text-emerald-700">
                  {formatCurrency(lastUsage.totalCostIdr)}
                </span>
              </div>
            </>
          ) : (
            <p className="py-3 text-center text-[11px] text-muted-foreground">
              Belum ada request yang dieksekusi di sesi ini.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Current Balance Widget */}
      <Card className="border border-indigo-100 bg-indigo-50/40 shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-indigo-700 uppercase">
            <Coins className="h-3.5 w-3.5 text-indigo-600" />
            Sisa Saldo Real-Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-xl font-black text-indigo-950">
            {formatCurrency(currentBalance)}
          </div>
          <p className="mt-1 text-[10px] text-indigo-600/90">
            Diproses secara atomik via trigger PostgreSQL.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
