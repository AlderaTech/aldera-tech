"use client";

import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordForm } from "../_hooks/use-forgot-password-form";
import formStyles from "../../login/_components/login-form.module.css";
import { RequestStatus } from "./request-status";
import styles from "./forgot-password.module.css";

export function ForgotPasswordForm() {
  const { state, formAction, isPending, email, setEmail } =
    useForgotPasswordForm();

  return (
    <form
      action={formAction}
      aria-busy={isPending}
      aria-labelledby="forgot-password-title"
      className={formStyles.form}
    >
      <RequestStatus state={state} />
      <div className={formStyles.field}>
        <Label htmlFor="email" className={formStyles.label}>
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nama@email.com"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          aria-invalid={!!state.errors?.email}
          aria-describedby={
            state.errors?.email
              ? "forgot-password-email-error"
              : "forgot-password-email-hint"
          }
          className={formStyles.input}
        />
        {state.errors?.email ? (
          <p
            id="forgot-password-email-error"
            role="alert"
            className={formStyles.fieldError}
          >
            {state.errors.email}
          </p>
        ) : (
          <p id="forgot-password-email-hint" className={styles.hint}>
            Gunakan email yang terhubung ke akun Aldera Tech Anda.
          </p>
        )}
      </div>
      <div className={formStyles.footer}>
        <Button
          type="submit"
          size="xl"
          disabled={isPending}
          className={formStyles.submit}
        >
          {isPending ? (
            <>
              <Loader2
                className="size-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="size-4" aria-hidden="true" /> Kirim Tautan Reset
            </>
          )}
        </Button>
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {isPending ? "Mengirim permintaan reset password." : ""}
      </span>
    </form>
  );
}
