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
import { cn } from "@/lib/utils";
import styles from "./login-form.module.css";

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

  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );
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
    <form
      action={formAction}
      aria-busy={isPending}
      aria-labelledby="login-title"
      className={styles.form}
    >
      {!state.ok && state.message && (
        <p role="alert" className={styles.formError}>
          {state.message}
        </p>
      )}
      <CardContent className={styles.fields}>
        <div className={styles.field}>
          <Label htmlFor="email" className={styles.label}>
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            aria-invalid={!!state.errors?.email}
            aria-describedby={
              state.errors?.email ? "login-email-error" : undefined
            }
            className={styles.input}
          />
          {state.errors?.email && (
            <p
              id="login-email-error"
              role="alert"
              className={styles.fieldError}
            >
              {state.errors.email}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <div className="flex min-h-10 items-center justify-between gap-3">
            <Label htmlFor="password" className={styles.label}>
              Password
            </Label>
            <Link
              href={AUTH_ROUTES.forgotPassword}
              className={styles.forgotLink}
            >
              Lupa password?
            </Link>
          </div>
          <div className={styles.passwordControl}>
            <PasswordInput
              id="password"
              name="password"
              placeholder="Masukkan password"
              autoComplete="current-password"
              required
              aria-invalid={!!state.errors?.password}
              aria-describedby={
                state.errors?.password ? "login-password-error" : undefined
              }
              showPassword={showPassword}
              onTogglePassword={togglePassword}
              className={cn(styles.input, styles.passwordInput)}
            />
          </div>
          {state.errors?.password && (
            <p
              id="login-password-error"
              role="alert"
              className={styles.fieldError}
            >
              {state.errors.password}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className={styles.footer}>
        <Button
          type="submit"
          size="xl"
          disabled={isPending}
          className={styles.submit}
        >
          {isPending ? (
            <>
              <Loader2
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />{" "}
              Memproses...
            </>
          ) : (
            <>
              <LogIn className="size-4" aria-hidden="true" /> Masuk
            </>
          )}
        </Button>
      </CardFooter>
    </form>
  );
}
