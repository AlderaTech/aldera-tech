import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import mascot from "@/public/images/auth/aldera-cat-register.webp";
import authStyles from "../../login/_components/login-experience.module.css";
import styles from "./register.module.css";

type RegisterExperienceProps = {
  children: ReactNode;
};

export function RegisterExperience({ children }: RegisterExperienceProps) {
  return (
    <div
      className={cn(
        "tech-playful",
        authStyles.loginExperience,
        styles.experience
      )}
    >
      <div className={authStyles.frame}>
        <aside className={authStyles.brandPanel}>
          <div className={authStyles.brandHeader}>
            <Logo size="md" href={PUBLIC_ROUTES.home} />
          </div>

          <div className={authStyles.mascotStage} aria-hidden="true">
            <span className={authStyles.mascotGlow} />
            <Image
              src={mascot}
              alt=""
              quality={90}
              sizes="(min-width: 1024px) 480px, (min-width: 640px) 340px, 1px"
              className={authStyles.mascot}
            />
          </div>

          <div className={authStyles.brandCopy}>
            <h2>
              Langkah baru.
              <span>Mulai bersama Aldera.</span>
            </h2>
            <p className={authStyles.brandDescription}>
              Mari wujudkan ide digital Anda, bersama.
            </p>
          </div>
        </aside>

        <section
          className={authStyles.formPanel}
          aria-labelledby="register-title"
        >
          <Link href={PUBLIC_ROUTES.home} className={authStyles.homeLink}>
            <ArrowLeft aria-hidden="true" />
            Kembali ke Beranda
          </Link>

          <div className={cn(authStyles.formContent, styles.content)}>
            <p className={authStyles.formEyebrow}>PORTAL ALDERA TECH</p>
            <h1 id="register-title">Buat akun Aldera Tech</h1>
            <p className={cn(authStyles.formDescription, styles.description)}>
              Lengkapi data Anda, lalu verifikasi akun melalui WhatsApp.
            </p>
            {children}
            <div className={cn(authStyles.registerPrompt, styles.loginPrompt)}>
              <span>Sudah punya akun?</span>
              <Link href={AUTH_ROUTES.login}>
                Masuk <ArrowUpRight aria-hidden="true" />
              </Link>
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
