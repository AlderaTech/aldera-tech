import type { OrderRequest } from "@prisma/client";
import { Calculator, CalendarDays, Layers3, FileText, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { orderStatusMeta } from "../_data/order-status";
import styles from "./orders.module.css";

type OrderCardData = Pick<
  OrderRequest,
  | "status"
  | "createdAt"
  | "features"
  | "customFeatures"
  | "urgency"
  | "notes"
  | "estimatedTotal"
> & {
  projectType: { name: string };
};

export function OrderCard({ order }: { order: OrderCardData }) {
  const meta = orderStatusMeta[order.status];
  const features = order.features as string[];
  const customFeatures = order.customFeatures as { name: string }[];

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <div className={styles.identity}>
          <span className={styles.icon} aria-hidden="true">
            <Calculator />
          </span>
          <div className={styles.heading}>
            <h2>{order.projectType.name}</h2>
            <div className={styles.badges}>
              <Badge
                variant={meta.variant}
                className={styles.status}
                data-status={order.status}
              >
                <span className={styles.dot} aria-hidden="true" />
                {meta.label}
              </Badge>
              {order.urgency === "urgent" && (
                <Badge className={styles.urgent}>
                  <Zap aria-hidden="true" />
                  Urgent
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className={styles.amount}>
          <p>Estimasi biaya</p>
          <strong>{formatCurrency(Number(order.estimatedTotal))}</strong>
        </div>
      </div>
      <dl className={styles.metadata}>
        <div>
          <dt>
            <CalendarDays aria-hidden="true" />
            <span className="sr-only">Tanggal pengajuan</span>
          </dt>
          <dd>
            <time dateTime={order.createdAt.toISOString()}>
              {formatDate(order.createdAt)}
            </time>
          </dd>
        </div>
        <div>
          <dt>
            <Layers3 aria-hidden="true" />
            <span className="sr-only">Jumlah fitur</span>
          </dt>
          <dd>{features.length + customFeatures.length} fitur</dd>
        </div>
      </dl>
      {order.notes && (
        <div className={styles.notes}>
          <FileText aria-hidden="true" />
          <div>
            <h3>Catatan proyek</h3>
            <p>{order.notes}</p>
          </div>
        </div>
      )}
    </article>
  );
}
