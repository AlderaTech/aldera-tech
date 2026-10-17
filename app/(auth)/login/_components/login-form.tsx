"use client";

import { useActionState, useEffect } from "react";
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

function getSafeRedirectUrl(
  url: string | null | undefined,
  defaultPath: string
): string {
  if (!url || typeof url !== "string") {
    return defaultPath;
  }
  const trimmed = url.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\") ||
    trimmed.includes("://")
  ) {
    return defaultPath;
  }
  return trimmed;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;

  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const { showPassword, togglePassword } = usePasswordVisibility();

  useEffect(() => {
    if (state.ok) {
      toast.success("Berhasil masuk!");
      const defaultTarget = isStaff(state.role)
        ? ADMIN_ROUTES.home
        : DASHBOARD_ROUTES.home;
      const target = getSafeRedirectUrl(callbackUrl, defaultTarget);
      router.replace(target);
      router.refresh();
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, callbackUrl, router]);

  return (
    <form action={formAction}>
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
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-[#0F263A]"
            >
              Password
            </Label>
            <Link
              href={AUTH_ROUTES.forgotPassword}
              className="text-xs font-semibold text-[#00B1E1] transition-colors hover:text-[#0094BD]"
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
            className="h-12 rounded-xl border-slate-200 bg-white pr-11 text-[#0F263A] shadow-none focus-visible:border-[#00B1E1] focus-visible:ring-2 focus-visible:ring-[#00B1E1]/20"
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
          className="w-full rounded-full bg-[#00B1E1] font-bold text-[#0F263A] shadow-md shadow-[#00B1E1]/25 hover:bg-[#0094BD]"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin text-[#0F263A]" />{" "}
              Memproses...
            </>
          ) : (
            <>
              <LogIn className="size-4" /> Masuk
            </>
          )}
        </Button>
        <p className="text-center text-sm text-slate-500">
          Belum punya akun?{" "}
          <Link
            href={AUTH_ROUTES.register}
            className="font-bold text-[#00B1E1] transition-colors hover:text-[#0094BD]"
          >
            Daftar sekarang
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}
