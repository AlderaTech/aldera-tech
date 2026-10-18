import type { Metadata } from "next";
import { RegisterExperience } from "./_components/register-experience";
import { RegisterForm } from "./_components/register-form";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Buat akun Aldera Tech.",
};

export default function RegisterPage() {
  return (
    <RegisterExperience>
      <RegisterForm />
    </RegisterExperience>
  );
}
