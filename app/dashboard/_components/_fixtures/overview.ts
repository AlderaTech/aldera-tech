import type { ComponentProps } from "react";
import type { OverviewWelcome } from "../overview-welcome";
import type { OverviewProjects } from "../overview-projects";
import type { OverviewActivity } from "../overview-activity";
import type { OnboardingStep } from "../onboarding-card";
import { DASHBOARD_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";

export const user: ComponentProps<typeof OverviewWelcome>["user"] = {
  id: "overview-fixture",
  name: "Maya Putri",
  email: "maya@example.test",
  image: null,
  role: "CLIENT",
  roles: ["CLIENT"],
};

export const projects: ComponentProps<typeof OverviewProjects>["projects"] = [
  {
    id: "fixture-project",
    title: "Portal Operasional Bisnis",
    status: "IN_PROGRESS",
    progress: 43,
    updatedAt: new Date("2026-10-21T08:30:00Z"),
    milestones: [
      { title: "Review antarmuka", dueDate: new Date("2026-10-30T00:00:00Z") },
    ],
  },
];

export const recent: ComponentProps<typeof OverviewActivity>["recent"] = [
  {
    id: "fixture-activity",
    description: "Desain antarmuka siap ditinjau bersama tim.",
    createdAt: new Date("2026-10-21T08:30:00Z"),
    project: { id: projects[0].id, title: projects[0].title },
  },
];

export const steps: OnboardingStep[] = [
  {
    id: "profile",
    title: "Lengkapi profil",
    description: "Tambahkan nomor telepon dan foto profil.",
    done: true,
    cta: { label: "Lengkapi", href: DASHBOARD_ROUTES.profile },
  },
  {
    id: "project",
    title: "Miliki proyek pertama",
    description: "Hitung estimasi harga dan ajukan proyek Anda.",
    done: false,
    cta: { label: "Hitung Estimasi", href: PUBLIC_ROUTES.calculator },
  },
  {
    id: "message",
    title: "Tinggalkan pesan pertama",
    description: "Berkomunikasi langsung dalam halaman proyek.",
    done: false,
    cta: { label: "Lihat proyek", href: DASHBOARD_ROUTES.projects },
  },
  {
    id: "invoice",
    title: "Selesaikan invoice pertama",
    description: "Bayar invoice pertama untuk memulai sprint berikutnya.",
    done: false,
    cta: { label: "Lihat invoice", href: DASHBOARD_ROUTES.invoices },
  },
];
