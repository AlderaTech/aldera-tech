"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerAction, type ActionState } from "@/lib/actions/auth";
import { AUTH_ROUTES } from "@/lib/routes";

const initialState: ActionState = { ok: false };

export type RegisterContact = {
  name: string;
  email: string;
  phone: string;
};

export function useRegisterForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<ActionState>(initialState);
  const [isPending, startTransition] = useTransition();
  const [contact, setContact] = useState<RegisterContact>({
    name: "",
    email: "",
    phone: "",
  });

  function handleContactChange(field: keyof RegisterContact, value: string) {
    setContact((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await registerAction(formState, formData);
      setFormState(result);
      if (result.ok || result.success) {
        toast.success(
          result.message ?? "Kode verifikasi telah dikirim via WhatsApp."
        );
        const phoneParam =
          result.phone || (formData.get("phone") as string) || "";
        const emailParam =
          result.email || (formData.get("email") as string) || "";
        // Save contact info to sessionStorage for verification flow.
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(
              "aldera_otp_flow",
              JSON.stringify({ phone: phoneParam, email: emailParam })
            );
          } catch {
            // Ignore sessionStorage failure in restricted environments.
          }
        }

        router.push(AUTH_ROUTES.verifyOtpWithPhone(phoneParam));
      } else if (result.message) {
        toast.error(result.message);
      }
    });
  }

  return { formState, isPending, handleSubmit, contact, handleContactChange };
}
