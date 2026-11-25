"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/permissions";
import { queryRouter } from "@/lib/router-db";
import { ADMIN_ROUTES, DASHBOARD_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import {
  getServiceAvailability,
  type RelayService,
} from "@/lib/service-availability";
import { serviceAvailabilitySchema } from "@/lib/validations/relay";

export async function getRouterAvailabilityAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Silakan masuk terlebih dahulu.");
  return getServiceAvailability("ai_router");
}

export async function updateServiceAvailability(
  service: RelayService,
  enabled: boolean
) {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.roles ?? session.user.role)) {
    throw new Error("Aksi ini memerlukan akses admin.");
  }

  const input = serviceAvailabilitySchema.parse({ service, enabled });
  const { rows } = await queryRouter<{ enabled: boolean }>(
    `UPDATE service_availability
     SET enabled = $2, updated_at = NOW()
     WHERE service = $1 RETURNING enabled`,
    [input.service, input.enabled]
  );
  if (!rows[0]) throw new Error("Setelan layanan belum tersedia.");

  revalidatePath(DASHBOARD_ROUTES.aiRelay);
  if (input.service === "ai_router") {
    revalidatePath(ADMIN_ROUTES.aiRelay);
    revalidatePath(PUBLIC_ROUTES.aiRelay);
  } else {
    revalidatePath(ADMIN_ROUTES.telegramBot);
  }
  return rows[0];
}
