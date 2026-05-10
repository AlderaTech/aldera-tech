"use server";

import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validations/contact";

export type ContactActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export async function submitContactMessage(
  _: ContactActionState,
  formData: FormData
): Promise<ContactActionState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
    }
    return { ok: false, message: "Periksa kembali input Anda.", errors };
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject,
        message: parsed.data.message,
      },
    });
    return {
      ok: true,
      message: "Pesan terkirim! Kami akan merespons dalam 1x24 jam.",
    };
  } catch {
    return {
      ok: false,
      message: "Gagal mengirim pesan. Silakan coba lagi nanti.",
    };
  }
}
