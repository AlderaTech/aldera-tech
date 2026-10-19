"use client";

import {
  FolderKanban,
  Sparkles,
  PackagePlus,
  SlidersHorizontal,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useUrlState } from "@/lib/hooks/use-url-state";
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

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange}>
      <TabsList className="grid h-11 w-full grid-cols-2 p-1 sm:inline-flex sm:w-auto sm:grid-cols-4">
        <TabsTrigger value="types" className="flex items-center gap-2">
          <FolderKanban className="size-4" />
          <span>Jenis Proyek</span>
          <Badge
            variant="secondary"
            className="ml-1 px-1.5 py-0 text-[11px] font-medium"
          >
            {data.projectTypes.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="features" className="flex items-center gap-2">
          <Sparkles className="size-4" />
          <span>Fitur</span>
          <Badge
            variant="secondary"
            className="ml-1 px-1.5 py-0 text-[11px] font-medium"
          >
            {data.features.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="addons" className="flex items-center gap-2">
          <PackagePlus className="size-4" />
          <span>Add-On</span>
          <Badge
            variant="secondary"
            className="ml-1 px-1.5 py-0 text-[11px] font-medium"
          >
            {data.addOns.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="config" className="flex items-center gap-2">
          <SlidersHorizontal className="size-4" />
          <span>Pengaturan</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="types" className="mt-5 space-y-4">
        <ProjectTypesTab items={data.projectTypes} />
      </TabsContent>
      <TabsContent value="features" className="mt-5 space-y-4">
        <FeaturesTab items={data.features} projectTypes={data.projectTypes} />
      </TabsContent>
      <TabsContent value="addons" className="mt-5 space-y-4">
        <AddOnsTab items={data.addOns} />
      </TabsContent>
      <TabsContent value="config" className="mt-5 space-y-4">
        <ConfigTab config={data.config} />
      </TabsContent>
    </Tabs>
  );
}
