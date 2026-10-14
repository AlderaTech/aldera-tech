"use client";

import * as React from "react";
import { useActionState } from "react";
import { Building2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  updateSiteSettingsAction,
  type SettingsActionState,
} from "@/lib/actions/settings";
import type { PublicSiteSettings } from "@/lib/public-settings";
import { ProfileSettingsTab } from "./profile-settings-tab";
import { ContactSettingsTab } from "./contact-settings-tab";

const initialState: SettingsActionState = { ok: false };

export function SettingsForm({ settings }: { settings: PublicSiteSettings }) {
  const [siteState, siteAction, sitePending] = useActionState(
    updateSiteSettingsAction,
    initialState
  );

  React.useEffect(() => {
    if (siteState.message) {
      if (siteState.ok) toast.success(siteState.message);
      else toast.error(siteState.message);
    }
  }, [siteState]);

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
    </Tabs>
  );
}
