"use client";

import * as React from "react";
import { useActionState } from "react";
import { Building2, Share2, Tags } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  updatePricingSettingsAction,
  updateSiteSettingsAction,
  type SettingsActionState,
} from "@/lib/actions/settings";
import type {
  PublicPricingPlan,
  PublicSiteSettings,
} from "@/lib/public-settings";
import { ProfileSettingsTab } from "./profile-settings-tab";
import { ContactSettingsTab } from "./contact-settings-tab";
import { PricingSettingsTab } from "./pricing-settings-tab";

const initialState: SettingsActionState = { ok: false };

export function SettingsForm({
  settings,
  pricingPlans,
}: {
  settings: PublicSiteSettings;
  pricingPlans: PublicPricingPlan[];
}) {
  const [siteState, siteAction, sitePending] = useActionState(
    updateSiteSettingsAction,
    initialState
  );
  const [pricingState, pricingAction, pricingPending] = useActionState(
    updatePricingSettingsAction,
    initialState
  );

  React.useEffect(() => {
    if (siteState.message) {
      if (siteState.ok) toast.success(siteState.message);
      else toast.error(siteState.message);
    }
  }, [siteState]);

  React.useEffect(() => {
    if (pricingState.message) {
      if (pricingState.ok) toast.success(pricingState.message);
      else toast.error(pricingState.message);
    }
  }, [pricingState]);

  return (
    <Tabs defaultValue="profile" className="gap-0">
      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-5">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-white p-1 shadow-sm sm:w-max">
          <TabsTrigger value="profile" className="gap-2">
            <Building2 className="size-4" />
            Profil Website
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Share2 className="size-4" />
            Sosial & Kontak
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <Tags className="size-4" />
            Harga
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="profile">
        <ProfileSettingsTab
          settings={settings}
          action={siteAction}
          pending={sitePending}
        />
      </TabsContent>

      <TabsContent value="contact">
        <ContactSettingsTab
          settings={settings}
          action={siteAction}
          pending={sitePending}
        />
      </TabsContent>

      <TabsContent value="pricing">
        <PricingSettingsTab
          pricingPlans={pricingPlans}
          action={pricingAction}
          pending={pricingPending}
        />
      </TabsContent>
    </Tabs>
  );
}
