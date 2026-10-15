"use client";

import { useState, useTransition } from "react";
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
import { AUTH_ROUTES } from "@/lib/routes";

const initialState: ActionState = { ok: false };

export function RegisterForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<ActionState>(initialState);
  const [isPending, startTransition] = useTransition();
  const { showPassword, togglePassword } = usePasswordVisibility();

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
        const password = (formData.get("password") as string) || "";

        // Temporarily save to sessionStorage for seamless verification auto-login
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem(
              "aldera_otp_flow",
              JSON.stringify({
                phone: phoneParam,
                email: emailParam,
                password,
              })
            );
          } catch {
            // Ignore sessionStorage failure in restricted environments
          }
        }

        router.push(`/verify-otp?phone=${encodeURIComponent(phoneParam)}`);
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
            <Label
              htmlFor="name"
              className="text-sm font-semibold text-[#0F263A]"
            >
              Nama lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Nama lengkap Anda"
              autoComplete="name"
              required
              aria-invalid={!!formState.errors?.name}
              className="h-11 rounded-xl border-slate-200 bg-white text-[#0F263A] shadow-none focus-visible:border-[#00B1E1] focus-visible:ring-2 focus-visible:ring-[#00B1E1]/20"
            />
            {formState.errors?.name && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {formState.errors.name}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="email"
              className="text-sm font-semibold text-[#0F263A]"
            >
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nama@email.com"
              autoComplete="email"
              required
              aria-invalid={!!formState.errors?.email}
              className="h-11 rounded-xl border-slate-200 bg-white text-[#0F263A] shadow-none focus-visible:border-[#00B1E1] focus-visible:ring-2 focus-visible:ring-[#00B1E1]/20"
            />
            {formState.errors?.email && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {formState.errors.email}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="phone"
            className="text-sm font-semibold text-[#0F263A]"
          >
            Nomor WhatsApp Aktif <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="081234567890"
            autoComplete="tel"
            required
            aria-invalid={!!formState.errors?.phone}
            className="h-11 rounded-xl border-slate-200 bg-white text-[#0F263A] shadow-none focus-visible:border-[#00B1E1] focus-visible:ring-2 focus-visible:ring-[#00B1E1]/20"
          />
          {formState.errors?.phone ? (
            <p role="alert" className="text-xs font-medium text-destructive">
              {formState.errors.phone}
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Kode OTP 6-digit akan dikirimkan ke nomor WhatsApp ini untuk verifikasi akun.
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-[#0F263A]"
            >
              Password <span className="text-red-500">*</span>
            </Label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              required
              aria-invalid={!!formState.errors?.password}
              showPassword={showPassword}
              onTogglePassword={togglePassword}
              className="h-11 rounded-xl border-slate-200 bg-white pr-10 text-[#0F263A] shadow-none focus-visible:border-[#00B1E1] focus-visible:ring-2 focus-visible:ring-[#00B1E1]/20"
            />
            {formState.errors?.password && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {formState.errors.password}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-semibold text-[#0F263A]"
            >
              Konfirmasi password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Ulangi password"
              autoComplete="new-password"
              required
              aria-invalid={!!formState.errors?.confirmPassword}
              className="h-11 rounded-xl border-slate-200 bg-white text-[#0F263A] shadow-none focus-visible:border-[#00B1E1] focus-visible:ring-2 focus-visible:ring-[#00B1E1]/20"
            />
            {formState.errors?.confirmPassword && (
              <p role="alert" className="text-xs font-medium text-destructive">
                {formState.errors.confirmPassword}
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
          className="cursor-pointer w-full rounded-full bg-[#00B1E1] font-bold text-[#0F263A] shadow-md shadow-[#00B1E1]/25 hover:bg-[#0094BD]"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin text-[#0F263A]" />{" "}
              Memproses...
            </>
          ) : (
            <>
              <UserPlus className="size-4" /> Daftar & Kirim OTP
            </>
          )}
        </Button>
        <p className="text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link
            href={AUTH_ROUTES.login}
            className="cursor-pointer font-bold text-[#00B1E1] transition-colors hover:text-[#0094BD]"
          >
            Masuk
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}
