import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "../_components/auth-shell";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Masuk",
  description:
    "Masuk ke dashboard Aldera Tech untuk melihat progres proyek Anda.",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Masuk"
      title="Lanjutkan progres proyek Anda."
      description="Akses dashboard klien untuk memantau milestone, invoice, dan dokumen proyek."
      variant="login"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
