import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import mascot from "@/public/images/auth/aldera-cat-login.webp";
import styles from "./login-experience.module.css";

type LoginExperienceProps = {
  children: ReactNode;
};

export function LoginExperience({ children }: LoginExperienceProps) {
  return (
    <div className={cn("tech-playful", styles.loginExperience)}>
      <div className={styles.frame}>
        <aside className={styles.brandPanel}>
          <div className={styles.brandHeader}>
            <Logo size="md" href={PUBLIC_ROUTES.home} />
          </div>

          <div className={styles.mascotStage} aria-hidden="true">
            <span className={styles.mascotGlow} />
            <Image
              src={mascot}
              alt=""
              quality={90}
              sizes="(min-width: 1024px) 480px, (min-width: 640px) 340px, 1px"
              className={styles.mascot}
            />
          </div>

          <div className={styles.brandCopy}>
            <h2>
              Ide Anda.
              <span>Kita wujudkan bersama.</span>
            </h2>
            <p className={styles.brandDescription}>
              Terhubung dengan tim Aldera Tech.
            </p>
          </div>
        </aside>

        <section className={styles.formPanel} aria-labelledby="login-title">
          <Link href={PUBLIC_ROUTES.home} className={styles.homeLink}>
            <ArrowLeft aria-hidden="true" />
            Kembali ke Beranda
          </Link>

          <div className={styles.formContent}>
            <p className={styles.formEyebrow}>PORTAL ALDERA TECH</p>
            <h1 id="login-title">Masuk ke akun Anda</h1>
            <p className={styles.formDescription}>
              Gunakan email dan password terdaftar untuk melanjutkan.
            </p>
            {children}
            <div className={styles.registerPrompt}>
              <span>Belum punya akun?</span>
              <Link href={AUTH_ROUTES.register}>
                Daftar sekarang <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </div>
          <p className={styles.formFootnote}>Aldera Tech · Ruang kerja klien</p>
        </section>
      </div>
    </div>
  );
}
