import type { Metadata } from "next";
import { AuthShell } from "../_components/auth-shell";
import { RegisterForm } from "./_components/register-form";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Buat akun Solvo Tech.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Daftar"
      title="Buat workspace proyek Anda."
      description="Mulai dengan akun klien agar scope, komunikasi, dan handoff proyek lebih rapi."
      variant="register"
    >
      <RegisterForm />
    </AuthShell>
  );
}
