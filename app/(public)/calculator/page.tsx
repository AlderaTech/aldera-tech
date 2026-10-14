import { redirect } from "next/navigation";
import { PUBLIC_ROUTES } from "@/lib/routes";

export default function PublicCalculatorPage() {
  redirect(PUBLIC_ROUTES.calculator);
}
