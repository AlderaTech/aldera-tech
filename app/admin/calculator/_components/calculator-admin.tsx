"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type Props = {
  data: {
    projectTypes: AdminProjectType[];
    features: AdminFeature[];
    addOns: AdminAddOn[];
    config: AdminConfig;
  };
};

export function CalculatorAdmin({ data }: Props) {
  return (
    <Tabs defaultValue="types">
      <TabsList>
        <TabsTrigger value="types">Jenis Proyek</TabsTrigger>
        <TabsTrigger value="features">Fitur</TabsTrigger>
        <TabsTrigger value="addons">Add-On</TabsTrigger>
        <TabsTrigger value="config">Pengaturan</TabsTrigger>
      </TabsList>

      <TabsContent value="types" className="mt-4">
        <ProjectTypesTab items={data.projectTypes} />
      </TabsContent>
      <TabsContent value="features" className="mt-4">
        <FeaturesTab items={data.features} projectTypes={data.projectTypes} />
      </TabsContent>
      <TabsContent value="addons" className="mt-4">
        <AddOnsTab items={data.addOns} />
      </TabsContent>
      <TabsContent value="config" className="mt-4">
        <ConfigTab config={data.config} />
      </TabsContent>
    </Tabs>
  );
}
