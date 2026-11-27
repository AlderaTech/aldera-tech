import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import recoveryMascot from "@/public/images/auth/aldera-cat-recovery.webp";
import registerMascot from "@/public/images/auth/aldera-cat-register.webp";
import frame from "../login/_components/login-experience.module.css";
import styles from "./auth-shell.module.css";

export function AuthShell({
  eyebrow,
  title,
  description,
  variant,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  variant: "register" | "reset";
  children: ReactNode;
}) {
  return (
    <div className={cn("tech-playful", frame.loginExperience)}>
      <div className={frame.frame}>
        <aside className={frame.brandPanel}>
          <div className={frame.brandHeader}>
            <Logo size="md" href={PUBLIC_ROUTES.home} />
          </div>
          <div className={frame.mascotStage} aria-hidden="true">
            <span className={frame.mascotGlow} />
            <Image
              src={variant === "reset" ? recoveryMascot : registerMascot}
              alt=""
              quality={90}
              sizes="(min-width:1024px) 450px, (min-width:640px) 340px, 1px"
              className={frame.mascot}
            />
          </div>
          <div className={frame.brandCopy}>
            <h2>
              {variant === "reset" ? "Akses kembali." : "Satu langkah lagi."}
              <span>Terhubung bersama Aldera.</span>
            </h2>
            <p className={frame.brandDescription}>
              Kami bantu Anda melanjutkan langkah digital.
            </p>
          </div>
        </aside>
        <section className={frame.formPanel} aria-labelledby="auth-page-title">
          <Link href={AUTH_ROUTES.login} className={frame.homeLink}>
            <ArrowLeft aria-hidden="true" />
            Kembali ke Login
          </Link>
          <div className={cn(frame.formContent, styles.content)}>
            <p className={frame.formEyebrow}>{eyebrow}</p>
            <h1 id="auth-page-title">{title}</h1>
            <p className={frame.formDescription}>{description}</p>
            {children}
          </div>
          <p className={styles.footer}>Aldera Tech · Ruang kerja klien</p>
        </section>
      </div>
    </div>
  );
}
