import { redirect } from "next/navigation";
import { PUBLIC_ROUTES } from "@/lib/routes";

export default function DashboardCalculatorPage() {
  redirect(PUBLIC_ROUTES.calculator);
}
