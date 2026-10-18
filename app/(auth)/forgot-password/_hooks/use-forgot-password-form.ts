"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  requestPasswordResetAction,
  type ResetActionState,
} from "@/lib/actions/password-reset";
import { forgotPasswordEmailSchema } from "@/lib/validations/forgot-password-form";

const initialState: ResetActionState = { ok: false };

export function useForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [state, formAction, isPending] = useActionState(
    async (prevState: ResetActionState, formData: FormData) => {
      const parsed = forgotPasswordEmailSchema.safeParse(
        String(formData.get("email") ?? "")
      );
      if (!parsed.success) {
        return {
          ok: false,
          message: "Email tidak valid.",
          errors: { email: "Format email tidak valid" },
        };
      }
      const res = await requestPasswordResetAction(prevState, formData);
      if (!res.ok && res.message?.toLowerCase().includes("email")) {
        return { ...res, errors: { email: res.message } };
      }
      return res;
    },
    initialState
  );

  useEffect(() => {
    if (state.ok) {
      toast.success(state.message ?? "Cek WhatsApp Anda.");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return { state, formAction, isPending, email, setEmail };
}
