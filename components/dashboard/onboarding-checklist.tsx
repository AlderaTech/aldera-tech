import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { safeDb } from "@/lib/safe-db";
import { cn } from "@/lib/utils";

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
      cta: { label: "Hitung Estimasi", href: DASHBOARD_ROUTES.calculator },
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
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-chart-4/5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 text-xs font-medium tracking-wider text-primary uppercase">
            <Sparkles className="size-3.5" />
            Mulai di sini
          </div>
          <h2 className="text-lg font-semibold">Checklist Onboarding</h2>
          <p className="text-sm text-muted-foreground">
            Selesaikan {completed} dari {total} langkah untuk memaksimalkan
            pengalaman Anda.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tabular-nums">{percent}%</div>
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="mt-5 space-y-2">
        {steps.map((step) => (
          <li
            key={step.id}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 transition-colors",
              step.done
                ? "border-success/20 bg-success/5"
                : "hover:bg-accent/30"
            )}
          >
            <div
              className={cn(
                "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                step.done
                  ? "bg-success text-success-foreground"
                  : "border-2 border-muted-foreground/30"
              )}
            >
              {step.done && <Check className="size-3.5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "text-sm font-medium",
                  step.done && "line-through opacity-60"
                )}
              >
                {step.title}
              </div>
              <div className="text-xs text-muted-foreground">
                {step.description}
              </div>
            </div>
            {!step.done && (
              <Link
                href={step.cta.href}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary transition-all hover:gap-2"
              >
                {step.cta.label}
                <ArrowRight className="size-3" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
