import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginExperience } from "./_components/login-experience";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Masuk",
  description:
    "Masuk ke dashboard Aldera Tech untuk melihat progres proyek Anda.",
};

export default function LoginPage() {
  return (
    <LoginExperience>
      <Suspense>
        <LoginForm />
      </Suspense>
    </LoginExperience>
  );
}
