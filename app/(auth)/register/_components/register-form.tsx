"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "../../_components/password-input";
import { usePasswordVisibility } from "../../_hooks/use-password-visibility";

import { registerAction, type ActionState } from "@/lib/actions/auth";
import { AUTH_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";

const initialState: ActionState = { ok: false };

export function RegisterForm() {
  const router = useRouter();
  const [state] = useActionState(registerAction, initialState);
  const [isPending, startTransition] = useTransition();
  const { showPassword, togglePassword } = usePasswordVisibility();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await registerAction(state, formData);
      if (result.ok) {
        toast.success(result.message ?? "Akun dibuat.");
        router.replace(DASHBOARD_ROUTES.home);
        router.refresh();
      } else if (result.message) {
        toast.error(result.message);
      }
    });
  }

  return (
    <form action={handleSubmit}>
      <CardContent className="space-y-4 px-5 pb-2 sm:px-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-bold text-black/72">
              Nama lengkap
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Nama lengkap Anda"
              autoComplete="name"
              required
              aria-invalid={!!state.errors?.name}
              className="h-11 border-black/12 bg-white text-black shadow-none focus-visible:border-[#0b6bff] focus-visible:ring-[#0b6bff]/25"
            />
            {state.errors?.name && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {state.errors.name}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
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
              className="h-11 border-black/12 bg-white text-black shadow-none focus-visible:border-[#0b6bff] focus-visible:ring-[#0b6bff]/25"
            />
            {state.errors?.email && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {state.errors.email}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="company"
              className="text-sm font-bold text-black/72"
            >
              Perusahaan
              <span className="font-medium text-black/42"> opsional</span>
            </Label>
            <Input
              id="company"
              name="company"
              placeholder="Nama perusahaan"
              autoComplete="organization"
              className="h-11 border-black/12 bg-white text-black shadow-none focus-visible:border-[#0b6bff] focus-visible:ring-[#0b6bff]/25"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-bold text-black/72">
              Telepon
              <span className="font-medium text-black/42"> opsional</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+62 812 3456 7890"
              autoComplete="tel"
              className="h-11 border-black/12 bg-white text-black shadow-none focus-visible:border-[#0b6bff] focus-visible:ring-[#0b6bff]/25"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-sm font-bold text-black/72"
            >
              Password
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
              className="h-11 border-black/12 bg-white pr-10 text-black shadow-none focus-visible:border-[#0b6bff] focus-visible:ring-[#0b6bff]/25"
            />
            {state.errors?.password && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {state.errors.password}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
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
              placeholder="Ulangi password"
              autoComplete="new-password"
              required
              aria-invalid={!!state.errors?.confirmPassword}
              className="h-11 border-black/12 bg-white text-black shadow-none focus-visible:border-[#0b6bff] focus-visible:ring-[#0b6bff]/25"
            />
            {state.errors?.confirmPassword && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {state.errors.confirmPassword}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-3 px-5 pt-4 pb-5 sm:px-6 sm:pb-6">
        <Button
          type="submit"
          size="xl"
          disabled={isPending}
          className="w-full bg-[#0b6bff] text-white hover:bg-[#075bd8]"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Memproses...
            </>
          ) : (
            <>
              <UserPlus className="size-4" /> Daftar
            </>
          )}
        </Button>
        <p className="text-center text-sm text-black/58">
          Sudah punya akun?{" "}
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
