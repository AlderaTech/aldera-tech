"use client";

import { useActionState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { AuthShell } from "../../_components/auth-shell";
import { PasswordInput } from "../../_components/password-input";
import { usePasswordVisibility } from "../../_hooks/use-password-visibility";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resetPasswordAction,
  type ResetActionState,
} from "@/lib/actions/password-reset";
import { AUTH_ROUTES } from "@/lib/routes";

const initialState: ResetActionState = { ok: false };

export function ResetFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [state] = useActionState(resetPasswordAction, initialState);
  const [isPending, startTransition] = useTransition();
  const { showPassword, togglePassword } = usePasswordVisibility();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await resetPasswordAction(state, formData);
      if (result.ok) {
        toast.success(result.message ?? "Password diperbarui.");
        router.replace(AUTH_ROUTES.login);
      } else {
        toast.error(result.message ?? "Gagal memperbarui password.");
      }
    });
  }

  if (!token) {
    return (
      <AuthShell
        eyebrow="Reset password"
        title="Link reset tidak valid."
        description="Pastikan Anda membuka link lengkap dari email atau minta link reset baru."
        variant="reset"
      >
        <CardContent className="px-6 pb-2 sm:px-8">
          <div className="rounded-lg border border-black/10 bg-[#f5f8ff] p-4 text-sm leading-relaxed text-black/62">
            Token reset tidak ditemukan pada URL. Untuk keamanan, minta link
            baru melalui halaman lupa password.
          </div>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
          <Button
            asChild
            size="xl"
            className="w-full bg-[#08090d] text-white hover:bg-black"
          >
            <Link href={AUTH_ROUTES.forgotPassword}>Minta link baru</Link>
          </Button>
        </CardFooter>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Buat password baru."
      description="Pilih password baru yang kuat agar akses dashboard proyek tetap aman."
      variant="reset"
    >
      <form action={handleSubmit}>
        <input type="hidden" name="token" value={token} />
        <CardContent className="space-y-5 px-6 pb-2 sm:px-8">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-bold text-black/72">
              Password baru
            </Label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
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
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-bold text-black/72"
            >
              Konfirmasi password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Ulangi password baru"
              autoComplete="new-password"
              required
              aria-invalid={!!state.errors?.confirmPassword}
              className="h-12 border-black/12 bg-white text-black shadow-none focus-visible:border-[#0b6bff] focus-visible:ring-[#0b6bff]/25"
            />
            {state.errors?.confirmPassword && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {state.errors.confirmPassword}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
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
                <ShieldCheck className="size-4" /> Reset password
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </AuthShell>
  );
}
