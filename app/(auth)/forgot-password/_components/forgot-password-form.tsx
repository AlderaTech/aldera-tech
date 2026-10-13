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
          <Label htmlFor="email" className="text-sm font-bold text-black/72">
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
            className="h-12 border-black/12 bg-white text-black shadow-none focus-visible:border-[#0b6bff] focus-visible:ring-[#0b6bff]/25"
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
          className="w-full bg-[#08090d] text-white hover:bg-black"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Mengirim...
            </>
          ) : (
            <>
              <MessageSquare className="size-4" /> Kirim link via WhatsApp
            </>
          )}
        </Button>
        <p className="text-center text-sm text-black/58">
          Ingat password Anda?{" "}
          <Link
            href={AUTH_ROUTES.login}
            className="font-bold text-[#0b6bff] transition-colors hover:text-[#075bd8]"
          >
            Masuk
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}
