import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AuthShell } from "../_components/auth-shell";
import { VerifyOtpForm } from "./_components/verify-otp-form";

export const metadata: Metadata = {
  title: "Verifikasi WhatsApp",
  description:
    "Masukkan 6-digit kode verifikasi OTP yang kami kirimkan ke WhatsApp Anda untuk mengaktifkan akun.",
};

function VerifyOtpSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12 text-slate-500">
      <Loader2 className="size-8 animate-spin text-[#00B1E1]" />
      <p className="text-sm">Memuat halaman verifikasi...</p>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <AuthShell
      eyebrow="Verifikasi Akun"
      title="Verifikasi Nomor WhatsApp Anda"
      description="Masukkan 6 digit kode OTP yang kami kirimkan ke nomor WhatsApp Anda untuk menyelesaikan pendaftaran dan mengaktifkan akun."
      variant="register"
    >
      <Suspense fallback={<VerifyOtpSkeleton />}>
        <VerifyOtpForm />
      </Suspense>
    </AuthShell>
  );
}
