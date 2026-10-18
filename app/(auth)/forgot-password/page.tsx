import type { Metadata } from "next";
import { ForgotPasswordExperience } from "./_components/forgot-password-experience";
import { ForgotPasswordForm } from "./_components/forgot-password-form";

export const metadata: Metadata = {
  title: "Lupa Password",
  description: "Minta link reset password untuk akun Aldera Tech Anda.",
};

export default function ForgotPasswordPage() {
  return (
    <ForgotPasswordExperience>
      <ForgotPasswordForm />
    </ForgotPasswordExperience>
  );
}
