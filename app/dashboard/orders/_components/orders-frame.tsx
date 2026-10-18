import type { ReactNode } from "react";
import Link from "next/link";
import { Calculator, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import commonStyles from "../../projects/_components/project-list.module.css";

export function OrdersFrame({ children }: { children: ReactNode }) {
  return (
    <div className={commonStyles.page} aria-labelledby="orders-heading">
      <div className={commonStyles.header}>
        <div>
          <p className={commonStyles.eyebrow}>Perencanaan proyek</p>
          <h1 id="orders-heading">Riwayat Estimasi</h1>
          <p className={commonStyles.description}>
            Pantau estimasi proyek yang pernah Anda ajukan.
          </p>
        </div>
        <Button asChild className={commonStyles.primaryButton}>
          <Link href={DASHBOARD_ROUTES.calculator}>
            <Calculator aria-hidden="true" /> Estimasi Baru{" "}
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
      {children}
    </div>
  );
}
