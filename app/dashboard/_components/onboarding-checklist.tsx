import Link from "next/link";
import { Check, ArrowRight, Layers } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DASHBOARD_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { safeDb } from "@/lib/safe-db";
import { cn } from "@/lib/utils";
import styles from "./overview.module.css";
import onboardingStyles from "./overview-onboarding.module.css";

type Step = {
  id: string;
  title: string;
  description: string;
  done: boolean;
  cta: { label: string; href: string };
};

export async function OnboardingChecklist() {
  const session = await auth();
  if (!session?.user) return null;
  const userId = session.user.id;

  const data = await safeDb(
    async () => {
      const [user, projectCount, messageCount, paidInvoiceCount] =
        await Promise.all([
          prisma.user.findUnique({
            where: { id: userId },
            select: { avatar: true, phone: true },
          }),
          prisma.project.count({ where: { clientId: userId } }),
          prisma.projectMessage.count({
            where: { project: { clientId: userId }, authorId: userId },
          }),
          prisma.invoice.count({
            where: { clientId: userId, status: "PAID" },
          }),
        ]);
      return { user, projectCount, messageCount, paidInvoiceCount };
    },
    { user: null, projectCount: 0, messageCount: 0, paidInvoiceCount: 0 }
  );

  const profileComplete = !!data.user?.phone;

  const steps: Step[] = [
    {
      id: "profile",
      title: "Lengkapi profil",
      description: "Tambahkan nomor telepon dan foto profil.",
      done: profileComplete,
      cta: { label: "Lengkapi", href: DASHBOARD_ROUTES.profile },
    },
    {
      id: "project",
      title: "Miliki proyek pertama",
      description: "Hitung estimasi harga dan ajukan proyek Anda.",
      done: data.projectCount > 0,
      cta: { label: "Hitung Estimasi", href: PUBLIC_ROUTES.calculator },
    },
    {
      id: "message",
      title: "Tinggalkan pesan pertama",
      description: "Berkomunikasi langsung dalam halaman proyek.",
      done: data.messageCount > 0,
      cta: { label: "Lihat proyek", href: DASHBOARD_ROUTES.projects },
    },
    {
      id: "invoice",
      title: "Selesaikan invoice pertama",
      description: "Bayar invoice pertama untuk memulai sprint berikutnya.",
      done: data.paidInvoiceCount > 0,
      cta: { label: "Lihat invoice", href: DASHBOARD_ROUTES.invoices },
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;

  // Hide once fully completed
  if (completed === total) return null;

  const percent = Math.round((completed / total) * 100);

  return (
    <section className={styles.panel} aria-labelledby="onboarding-heading">
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>
            <Layers aria-hidden="true" /> Mulai di sini
          </p>
          <h2 id="onboarding-heading" className={styles.sectionTitle}>
            Checklist Onboarding
          </h2>
        </div>
        <span className={onboardingStyles.percent}>{percent}%</span>
      </div>
      <p className={onboardingStyles.summary}>
        Selesaikan{" "}
        <strong>
          {completed} dari {total} langkah
        </strong>{" "}
        untuk memaksimalkan pengalaman Anda.
      </p>
      <progress
        className={styles.progress}
        value={percent}
        max={100}
        aria-label="Progres onboarding"
      >
        {percent}%
      </progress>
      <ul className={onboardingStyles.steps}>
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              onboardingStyles.step,
              step.done && onboardingStyles.done
            )}
          >
            <span className={onboardingStyles.stepIcon} aria-hidden="true">
              {step.done ? <Check /> : String(index + 1).padStart(2, "0")}
            </span>
            <div className={onboardingStyles.stepCopy}>
              <h3>
                {step.title}
                <span className="sr-only">
                  {step.done ? ": selesai" : ": belum selesai"}
                </span>
              </h3>
              <p>{step.description}</p>
              {!step.done && (
                <Link href={step.cta.href} className={styles.textLink}>
                  {step.cta.label}
                  <ArrowRight aria-hidden="true" />
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
