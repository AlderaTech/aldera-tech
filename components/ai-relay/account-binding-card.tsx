"use client";
import { DataLoadError } from "@/components/shared/data-load-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Send, ShieldCheck } from "lucide-react";
import { BindingLinkedPanel } from "./_components/binding-linked-panel";
import { BindingUnlinkedPanel } from "./_components/binding-unlinked-panel";
import { RelayPauseCard } from "./relay-pause-card";
import {
  useAccountBinding,
  type AccountBindingState,
} from "./_hooks/use-account-binding";
export function AccountBindingCard() {
  return <AccountBindingView state={useAccountBinding()} />;
}
export function AccountBindingView({ state }: { state: AccountBindingState }) {
  const { loading, submitting, status, fetchStatus } = state;
  if (status.availability === "paused") {
    return (
      <div className="space-y-4">
        <RelayPauseCard view="telegram" />
        {status.isBound && <BindingLinkedPanel state={state} />}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={fetchStatus}
          disabled={loading || submitting}
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Periksa ketersediaan
        </Button>
      </div>
    );
  }
  if (status.error && !loading)
    return (
      <DataLoadError
        headingLevel={2}
        reset={() => {
          void fetchStatus();
        }}
      />
    );
  if (loading) {
    return (
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3.5 w-72" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 self-start rounded-md sm:self-auto" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-2.5 text-blue-600">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                Integrasi Telegram Bot
                {status.isBound ? (
                  <Badge className="border-emerald-200 bg-emerald-100 text-xs font-semibold text-emerald-800 hover:bg-emerald-100">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    Terhubung
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-xs font-semibold text-amber-800"
                  >
                    Belum Terhubung
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                Sinkronisasikan saldo Rupiah, top-up, dan API Key antara
                dashboard web dan bot Telegram.
              </CardDescription>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchStatus}
            disabled={submitting}
            className="h-8 self-start text-xs text-slate-600 hover:text-slate-900 sm:self-auto"
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-0">
        {status.isBound ? (
          <BindingLinkedPanel state={state} />
        ) : (
          <BindingUnlinkedPanel state={state} />
        )}
      </CardContent>
    </Card>
  );
}
