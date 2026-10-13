"use client";

import { useActionState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "../../_components/password-input";
import { usePasswordVisibility } from "../../_hooks/use-password-visibility";

import { loginAction, type ActionState } from "@/lib/actions/auth";
import { isStaff } from "@/lib/permissions";
import { ADMIN_ROUTES, AUTH_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";

const initialState: ActionState = { ok: false };

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;

  const [state] = useActionState(loginAction, initialState);
  const [isPending, startTransition] = useTransition();
  const { showPassword, togglePassword } = usePasswordVisibility();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await loginAction(state, formData);
      if (result.ok) {
        toast.success("Berhasil masuk!");
        const target =
          callbackUrl ??
          (isStaff(result.role) ? ADMIN_ROUTES.home : DASHBOARD_ROUTES.home);
        router.replace(target);
        router.refresh();
      } else if (result.message) {
        toast.error(result.message);
      }
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
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label
              htmlFor="password"
              className="text-sm font-bold text-black/72"
            >
              Password
            </Label>
            <Link
              href={AUTH_ROUTES.forgotPassword}
              className="text-xs font-semibold text-black/48 transition-colors hover:text-[#0b6bff]"
              tabIndex={-1}
            >
              Lupa password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Masukkan password"
            autoComplete="current-password"
            required
            aria-invalid={!!state.errors?.password}
            showPassword={showPassword}
            onTogglePassword={togglePassword}
            className="h-12 border-black/12 bg-white pr-11 text-black shadow-none focus-visible:border-[#0b6bff] focus-visible:ring-[#0b6bff]/25"
          />
          {state.errors?.password && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {state.errors.password}
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
              <Loader2 className="size-4 animate-spin" /> Memproses...
            </>
          ) : (
            <>
              <LogIn className="size-4" /> Masuk
            </>
          )}
        </Button>
        <p className="text-center text-sm text-black/58">
          Belum punya akun?{" "}
          <Link
            href={AUTH_ROUTES.register}
            className="font-bold text-[#0b6bff] transition-colors hover:text-[#075bd8]"
          >
            Daftar sekarang
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}
