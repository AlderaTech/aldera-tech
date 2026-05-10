import type { Metadata } from "next";
import { AuthShell } from "../_components/auth-shell";
import { ForgotPasswordForm } from "./_components/forgot-password-form";

export const metadata: Metadata = {
  title: "Lupa Password",
  description: "Minta link reset password untuk akun Solvo Tech Anda.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Pemulihan"
      title="Pulihkan akses akun Anda."
      description="Masukkan email akun Anda. Kami akan mengirim link reset jika email tersebut terdaftar."
      variant="forgot"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
