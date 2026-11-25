import {
  getServiceAvailability,
  type RelayService,
} from "@/lib/service-availability";
import { ServiceAvailabilitySwitch } from "./service-availability-switch";

export async function ServiceAvailabilityControl({
  service,
}: {
  service: RelayService;
}) {
  let enabled: boolean | null = null;
  try {
    enabled = await getServiceAvailability(service);
  } catch (error) {
    console.error("[ServiceAvailabilityControl]", error);
  }
  return <ServiceAvailabilitySwitch service={service} enabled={enabled} />;
}
