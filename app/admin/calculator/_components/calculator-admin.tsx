"use client";

import {
  FolderKanban,
  Sparkles,
  PackagePlus,
  SlidersHorizontal,
} from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  WorkspaceTabsList as TabsList,
  WorkspaceTabsTrigger as TabsTrigger,
} from "@/components/dashboard/workspace-segmented-tabs";
import { Badge } from "@/components/ui/badge";
import { useUrlState } from "@/lib/hooks/use-url-state";
import { AdminStatCard } from "../../_components/admin-stat-card";
import { ProjectTypesTab } from "./project-types-tab";
import { FeaturesTab } from "./features-tab";
import { AddOnsTab } from "./add-ons-tab";
import { ConfigTab } from "./config-tab";
import type {
  AdminProjectType,
  AdminFeature,
  AdminAddOn,
  AdminConfig,
} from "../_types/calculator-admin";

export type { AdminProjectType, AdminFeature, AdminAddOn, AdminConfig };

const ALLOWED_CALCULATOR_TABS = [
  "types",
  "features",
  "addons",
  "config",
] as const;
type CalculatorTab = (typeof ALLOWED_CALCULATOR_TABS)[number];

type Props = {
  data: {
    projectTypes: AdminProjectType[];
    features: AdminFeature[];
    addOns: AdminAddOn[];
    config: AdminConfig;
  };
  initialTab?: string;
};

export function CalculatorAdmin({ data, initialTab = "types" }: Props) {
  const { getParam, setParam } = useUrlState();
  const tabParam = getParam("tab", initialTab);
  const currentTab = ALLOWED_CALCULATOR_TABS.includes(tabParam as CalculatorTab)
    ? tabParam
    : initialTab;

  function handleTabChange(value: string) {
    setParam("tab", value);
  }

  const majorFeaturesCount = data.features.filter((f) => f.isMajor).length;
  const dpPercentage = data.config?.dpPercentage ?? 25;
  const freeRevisions = data.config?.freeRevisions ?? 2;
  const urgencyMultiplier = data.config?.urgencyMultiplier ?? 1.5;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Jenis Proyek"
          value={data.projectTypes.length}
          helper="Kategori layanan & harga dasar"
          icon={FolderKanban}
          toneClassName="border-primary/20 bg-primary/10 text-primary"
        />
        <AdminStatCard
          label="Fitur Kalkulator"
          value={data.features.length}
          helper={`${majorFeaturesCount} fitur utama (major) aktif`}
          icon={Sparkles}
          toneClassName="border-sky-200 bg-sky-50 text-sky-700"
        />
        <AdminStatCard
          label="Opsi Add-On"
          value={data.addOns.length}
          helper="Paket retainer & maintenance bulanan"
          icon={PackagePlus}
          toneClassName="border-emerald-200 bg-emerald-50 text-emerald-700"
        />
        <AdminStatCard
          label="Pengaturan Formula"
          value={`DP ${dpPercentage}%`}
          helper={`Kuota ${freeRevisions}x revisi gratis • Rush ${urgencyMultiplier}x`}
          icon={SlidersHorizontal}
          toneClassName="border-amber-200 bg-amber-50 text-amber-700"
        />
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger
            value="types"
            className="flex min-h-9 w-full items-center justify-between gap-2 rounded-[0.6rem] px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xs data-[state=active]:hover:bg-primary data-[state=active]:hover:text-white"
          >
            <span className="flex items-center gap-2 font-semibold">
              <FolderKanban className="size-4 shrink-0" />
              <span>Jenis Proyek</span>
            </span>
            <Badge
              variant="secondary"
              className="px-2 py-0 text-[11px] font-semibold tabular-nums data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              {data.projectTypes.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="features"
            className="flex min-h-9 w-full items-center justify-between gap-2 rounded-[0.6rem] px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xs data-[state=active]:hover:bg-primary data-[state=active]:hover:text-white"
          >
            <span className="flex items-center gap-2 font-semibold">
              <Sparkles className="size-4 shrink-0" />
              <span>Fitur</span>
            </span>
            <Badge
              variant="secondary"
              className="px-2 py-0 text-[11px] font-semibold tabular-nums data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              {data.features.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="addons"
            className="flex min-h-9 w-full items-center justify-between gap-2 rounded-[0.6rem] px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xs data-[state=active]:hover:bg-primary data-[state=active]:hover:text-white"
          >
            <span className="flex items-center gap-2 font-semibold">
              <PackagePlus className="size-4 shrink-0" />
              <span>Add-On</span>
            </span>
            <Badge
              variant="secondary"
              className="px-2 py-0 text-[11px] font-semibold tabular-nums data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              {data.addOns.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="config"
            className="flex min-h-9 w-full items-center justify-between gap-2 rounded-[0.6rem] px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xs data-[state=active]:hover:bg-primary data-[state=active]:hover:text-white"
          >
            <span className="flex items-center gap-2 font-semibold">
              <SlidersHorizontal className="size-4 shrink-0" />
              <span>Pengaturan</span>
            </span>
            <Badge
              variant="secondary"
              className="px-2 py-0 text-[11px] font-semibold data-[state=active]:bg-white/20 data-[state=active]:text-white"
            >
              Formula
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="mt-4 space-y-5">
          <ProjectTypesTab items={data.projectTypes} />
        </TabsContent>
        <TabsContent value="features" className="mt-4 space-y-5">
          <FeaturesTab items={data.features} projectTypes={data.projectTypes} />
        </TabsContent>
        <TabsContent value="addons" className="mt-4 space-y-5">
          <AddOnsTab items={data.addOns} />
        </TabsContent>
        <TabsContent value="config" className="mt-4 space-y-5">
          <ConfigTab config={data.config} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
