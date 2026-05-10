import "server-only";

import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";
import type { NotificationType, Prisma } from "@prisma/client";

export type NotifyArgs = {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
};

/**
 * Send a notification to a user via WhatsApp (if phone available and enabled).
 * Always persists the notification record regardless of delivery success.
 */
export async function notify({ userId, type, title, message, metadata }: NotifyArgs) {
  const [user, settings] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { phone: true } }),
    prisma.siteSetting.findUnique({ where: { id: "site" }, select: { whatsappNotify: true } }),
  ]);

  const record = await prisma.notification.create({
    data: { userId, type, title, message, channel: "whatsapp", metadata: metadata ?? undefined },
  });

  if (!user?.phone || !settings?.whatsappNotify) {
    return record;
  }

  const result = await sendWhatsApp({ to: user.phone, message: `*${title}*\n\n${message}` });

  await prisma.notification.update({
    where: { id: record.id },
    data: result.success
      ? { sentAt: new Date() }
      : { failedAt: new Date(), error: result.error },
  });

  return record;
}

/**
 * Send notification to multiple users (e.g., all team members on a project).
 * Non-blocking: errors on one user don't affect others.
 */
export async function notifyMany(users: string[], args: Omit<NotifyArgs, "userId">) {
  await Promise.allSettled(users.map((userId) => notify({ ...args, userId })));
}
