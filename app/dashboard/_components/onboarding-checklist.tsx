import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DASHBOARD_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { safeDb } from "@/lib/safe-db";
import { OnboardingCard, type OnboardingStep } from "./onboarding-card";

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

  const steps: OnboardingStep[] = [
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
    <OnboardingCard
      steps={steps}
      completed={completed}
      total={total}
      percent={percent}
    />
  );
}
