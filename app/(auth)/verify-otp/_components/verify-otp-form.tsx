"use client";

import { useState, useEffect, useRef, useTransition, useId } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ShieldCheck,
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { verifyOtpAction, resendOtpAction } from "@/lib/actions/auth";
import { AUTH_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const baseId = useId();

  // Read phone from searchParams
  const paramPhone = searchParams.get("phone") ?? "";

  // Read stored credentials from sessionStorage safely
  const [storedFlow] = useState<{
    phone?: string;
    email?: string;
    password?: string;
  } | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("aldera_otp_flow");
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const activePhone = paramPhone || storedFlow?.phone || "";
  const activeEmail = storedFlow?.email || "";
  const activePassword = storedFlow?.password || "";

  // 6 individual digit inputs
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer cooldown
  const [cooldown, setCooldown] = useState(60);
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);

  // Status feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Auto-focus the first digit on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleDigitChange(index: number, value: string) {
    if (isLocked || isSuccess) return;
    setErrorMessage(null);

    // Only allow digits
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    // Handle single character
    const lastChar = cleaned.slice(-1);
    const next = [...digits];
    next[index] = lastChar;
    setDigits(next);

    // Auto-advance focus to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);

    // Focus appropriate input
    const nextFocusIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextFocusIndex]?.focus();
  }

  const otpCode = digits.join("");
  const isComplete = otpCode.length === 6;

  function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!isComplete || isPending || isLocked) return;

    setErrorMessage(null);
    startTransition(async () => {
      const result = await verifyOtpAction({
        identifier: activePhone || activeEmail,
        token: otpCode,
        password: activePassword || undefined,
      });

      if (result.ok || result.success) {
        setIsSuccess(true);
        toast.success(result.message ?? "Nomor WhatsApp berhasil diverifikasi!");

        // Clean up sessionStorage
        if (typeof window !== "undefined") {
          try {
            sessionStorage.removeItem("aldera_otp_flow");
          } catch {
            // Ignore
          }
        }

        setTimeout(() => {
          router.replace(DASHBOARD_ROUTES.home);
          router.refresh();
        }, 1000);
      } else {
        setErrorMessage(result.message ?? "Kode OTP tidak valid.");
        if (result.remainingAttempts !== undefined) {
          setRemainingAttempts(result.remainingAttempts);
        }
        if (result.isLocked || (result.remainingAttempts !== undefined && result.remainingAttempts <= 0)) {
          setIsLocked(true);
        }
        toast.error(result.message ?? "Verifikasi OTP gagal.");
      }
    });
  }

  async function handleResend() {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage(null);

    try {
      const result = await resendOtpAction({
        phone: activePhone,
      });

      if (result.ok || result.success) {
        toast.success(result.message ?? "Kode OTP baru telah dikirim.");
        setCooldown(result.cooldownSeconds ?? 60);
        setDigits(["", "", "", "", "", ""]);
        setRemainingAttempts(5);
        setIsLocked(false);
        inputRefs.current[0]?.focus();
      } else {
        if (result.cooldownSeconds) {
          setCooldown(result.cooldownSeconds);
        }
        toast.error(result.message ?? "Gagal mengirim ulang OTP.");
        setErrorMessage(result.message ?? "Gagal mengirim ulang OTP.");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan saat mengirim ulang OTP.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <CardContent className="space-y-6 px-5 pb-2 sm:px-6">
        {/* Destination Information */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-sm text-[#0F263A]">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#00B1E1]/15 text-[#00B1E1]">
            <PhoneCall className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Dikirim ke nomor WhatsApp
            </p>
            <p className="truncate font-bold text-[#0F263A]">
              {activePhone || "Nomor WhatsApp Anda"}
            </p>
          </div>
        </div>

        {/* 6 Digit Input Group */}
        <div className="space-y-3">
          <label
            htmlFor={`${baseId}-digit-0`}
            className="block text-center text-sm font-semibold text-[#0F263A]"
          >
            Masukkan 6-digit kode OTP
          </label>
          <div
            className="flex items-center justify-center gap-2 sm:gap-3"
            onPaste={handlePaste}
          >
            {digits.map((digit, index) => (
              <input
                key={index}
                id={`${baseId}-digit-${index}`}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                disabled={isPending || isLocked || isSuccess}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`size-12 rounded-xl border text-center text-xl font-bold transition-all sm:size-14 sm:text-2xl ${
                  digit
                    ? "border-[#00B1E1] bg-[#00B1E1]/5 text-[#0F263A] ring-2 ring-[#00B1E1]/20"
                    : "border-slate-200 bg-white text-[#0F263A] focus:border-[#00B1E1] focus:ring-2 focus:ring-[#00B1E1]/20"
                } ${
                  errorMessage
                    ? "border-destructive text-destructive focus:border-destructive focus:ring-destructive/20"
                    : ""
                }`}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Validation & Attempts Feedback */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div className="space-y-0.5">
              <p className="font-semibold">{errorMessage}</p>
              {remainingAttempts !== null && remainingAttempts > 0 && !isLocked && (
                <p className="text-xs opacity-90">
                  Sisa kesempatan Anda: {remainingAttempts} kali.
                </p>
              )}
            </div>
          </div>
        )}

        {isSuccess && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
            <p>Verifikasi berhasil! Mengarahkan Anda ke dashboard...</p>
          </div>
        )}

        {/* Resend Cooldown UI */}
        <div className="flex flex-col items-center justify-center gap-2 pt-1 text-center">
          <p className="text-xs text-slate-500">
            Tidak menerima pesan kode di WhatsApp?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending || isPending}
            className={`cursor-pointer inline-flex items-center gap-1.5 text-sm font-bold transition-colors ${
              cooldown > 0 || isResending
                ? "cursor-not-allowed text-slate-400"
                : "text-[#00B1E1] hover:text-[#0094BD]"
            }`}
          >
            <RefreshCw
              className={`size-3.5 ${isResending ? "animate-spin" : ""}`}
            />
            {cooldown > 0
              ? `Kirim ulang dalam ${cooldown} detik`
              : "Kirim Ulang Kode OTP"}
          </button>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-3 px-5 pt-4 pb-5 sm:px-6 sm:pb-6">
        <Button
          type="submit"
          size="xl"
          disabled={!isComplete || isPending || isLocked || isSuccess}
          className="cursor-pointer w-full rounded-full bg-[#00B1E1] font-bold text-[#0F263A] shadow-md shadow-[#00B1E1]/25 hover:bg-[#0094BD] disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin text-[#0F263A]" />{" "}
              Memverifikasi...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="size-4" /> Terverifikasi
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" /> Verifikasi Sekarang{" "}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        <p className="text-center text-sm text-slate-500">
          Salah nomor telepon?{" "}
          <Link
            href={AUTH_ROUTES.register}
            className="cursor-pointer font-bold text-[#00B1E1] transition-colors hover:text-[#0094BD]"
          >
            Daftar ulang
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}
