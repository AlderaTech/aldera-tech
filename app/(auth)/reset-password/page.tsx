import type { Metadata } from "next";
import { ResetPasswordForm } from "./_components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Buat password baru untuk akun Solvo Tech Anda.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
