"use client";

import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRegisterForm } from "../_hooks/use-register-form";
import formStyles from "../../login/_components/login-form.module.css";
import { RegisterFields } from "./register-fields";

export function RegisterForm() {
  const { formState, isPending, handleSubmit, contact, handleContactChange } =
    useRegisterForm();

  return (
    <form
      action={handleSubmit}
      aria-busy={isPending}
      aria-labelledby="register-title"
      className={formStyles.form}
    >
      {!formState.ok && !formState.success && formState.message && (
        <p role="alert" className={formStyles.formError}>
          {formState.message}
        </p>
      )}
      <RegisterFields
        errors={formState.errors}
        contact={contact}
        onContactChange={handleContactChange}
      />
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
              Memproses...
            </>
          ) : (
            <>
              <UserPlus className="size-4" aria-hidden="true" /> Daftar & Kirim
              OTP
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
