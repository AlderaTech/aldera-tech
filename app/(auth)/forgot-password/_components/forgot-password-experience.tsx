import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import mascot from "@/public/images/auth/aldera-cat-recovery.webp";
import authStyles from "../../login/_components/login-experience.module.css";
import styles from "./forgot-password.module.css";

type ForgotPasswordExperienceProps = {
  children: ReactNode;
};

export function ForgotPasswordExperience({
  children,
}: ForgotPasswordExperienceProps) {
  return (
    <div
      className={cn(
        "tech-playful",
        authStyles.loginExperience,
        styles.experience
      )}
    >
      <div className={cn(authStyles.frame, styles.frame)}>
        <aside className={cn(authStyles.brandPanel, styles.brandPanel)}>
          <div className={authStyles.brandHeader}>
            <Logo size="md" href={PUBLIC_ROUTES.home} />
          </div>
          <div className={authStyles.mascotStage} aria-hidden="true">
            <span className={authStyles.mascotGlow} />
            <Image
              src={mascot}
              alt=""
              quality={90}
              sizes="(min-width: 1024px) 450px, (min-width: 640px) 340px, 1px"
              className={authStyles.mascot}
            />
          </div>
          <div className={authStyles.brandCopy}>
            <h2>
              Akses kembali.
              <span>Lanjutkan ide Anda.</span>
            </h2>
            <p className={authStyles.brandDescription}>
              Kami bantu Anda kembali terhubung.
            </p>
          </div>
        </aside>

        <section
          className={authStyles.formPanel}
          aria-labelledby="forgot-password-title"
        >
          <Link href={AUTH_ROUTES.login} className={authStyles.homeLink}>
            <ArrowLeft aria-hidden="true" />
            Kembali ke Login
          </Link>
          <div className={cn(authStyles.formContent, styles.content)}>
            <p className={authStyles.formEyebrow}>PEMULIHAN AKUN</p>
            <h1 id="forgot-password-title">Lupa Password?</h1>
            <p className={authStyles.formDescription}>
              Masukkan email akun Anda untuk meminta tautan reset. Tautan
              dikirim melalui WhatsApp yang terdaftar.
            </p>
            {children}
            <div className={authStyles.registerPrompt}>
              <span>Ingat password Anda?</span>
              <Link href={AUTH_ROUTES.login}>Masuk</Link>
            </div>
          </div>
          <p className={authStyles.formFootnote}>
            Aldera Tech · Ruang kerja klien
          </p>
        </section>
      </div>
    </div>
  );
}
