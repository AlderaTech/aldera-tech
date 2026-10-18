import { CircleCheck, CircleAlert } from "lucide-react";
import type { ResetActionState } from "@/lib/actions/password-reset";
import { cn } from "@/lib/utils";
import styles from "./forgot-password.module.css";

type RequestStatusProps = {
  state: ResetActionState;
};

export function RequestStatus({ state }: RequestStatusProps) {
  if (!state.ok && !state.message) return null;

  const Icon = state.ok ? CircleCheck : CircleAlert;

  return (
    <div
      className={cn(styles.requestStatus, !state.ok && styles.requestError)}
      role={state.ok ? "status" : "alert"}
      aria-live={state.ok ? "polite" : "assertive"}
      aria-atomic="true"
    >
      <span className={styles.statusIcon} aria-hidden="true">
        <Icon />
      </span>
      <div>
        <p className={styles.statusTitle}>
          {state.ok ? "Permintaan diterima" : "Periksa permintaan Anda"}
        </p>
        <p className={styles.statusMessage}>
          {state.message ?? "Cek WhatsApp Anda."}
        </p>
      </div>
    </div>
  );
}
