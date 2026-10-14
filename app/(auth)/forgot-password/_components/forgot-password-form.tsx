"use client";

import { useActionState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  requestPasswordResetAction,
  type ResetActionState,
} from "@/lib/actions/password-reset";
import { AUTH_ROUTES } from "@/lib/routes";

const initialState: ResetActionState = { ok: false };

export function ForgotPasswordForm() {
  const [state] = useActionState(requestPasswordResetAction, initialState);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await requestPasswordResetAction(state, formData);
      if (result.ok) toast.success(result.message ?? "Cek WhatsApp Anda.");
      else toast.error(result.message ?? "Gagal mengirim link reset.");
    });
  }

  return (
    <form action={handleSubmit}>
      <CardContent className="space-y-5 px-6 pb-2 sm:px-8">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-semibold text-[#0F263A]"
          >
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            required
            aria-invalid={!!state.errors?.email}
            className="h-12 rounded-xl border-slate-200 bg-white text-[#0F263A] shadow-none focus-visible:border-[#00B1E1] focus-visible:ring-2 focus-visible:ring-[#00B1E1]/20"
          />
          {state.errors?.email && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {state.errors.email}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-4 px-6 pt-5 pb-6 sm:px-8 sm:pb-8">
        <Button
          type="submit"
          size="xl"
          disabled={isPending}
          className="w-full rounded-full bg-[#00B1E1] font-bold text-[#0F263A] shadow-md shadow-[#00B1E1]/25 hover:bg-[#0094BD]"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin text-[#0F263A]" />{" "}
              Mengirim...
            </>
          ) : (
            <>
              <MessageSquare className="size-4" /> Kirim link via WhatsApp
            </>
          )}
        </Button>
        <p className="text-center text-sm text-slate-500">
          Ingat password Anda?{" "}
          <Link
            href={AUTH_ROUTES.login}
            className="font-bold text-[#00B1E1] transition-colors hover:text-[#0094BD]"
          >
            Masuk
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}
