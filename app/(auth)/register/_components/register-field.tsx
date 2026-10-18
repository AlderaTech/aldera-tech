import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import fieldStyles from "../../login/_components/login-form.module.css";
import styles from "./register.module.css";

type RegisterFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function RegisterField({
  id,
  label,
  error,
  hint,
  children,
}: RegisterFieldProps) {
  return (
    <div className={fieldStyles.field}>
      <Label htmlFor={id} className={fieldStyles.label}>
        {label}{" "}
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      </Label>
      {children}
      {error ? (
        <p
          id={`register-${id}-error`}
          role="alert"
          className={fieldStyles.fieldError}
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`register-${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
