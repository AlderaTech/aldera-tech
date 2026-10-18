import { Input } from "@/components/ui/input";
import type { ActionState } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import type { RegisterContact } from "../_hooks/use-register-form";
import { PasswordInput } from "../../_components/password-input";
import { usePasswordVisibility } from "../../_hooks/use-password-visibility";
import fieldStyles from "../../login/_components/login-form.module.css";
import { RegisterField } from "./register-field";
import styles from "./register.module.css";

type RegisterFieldsProps = {
  errors: ActionState["errors"];
  contact: RegisterContact;
  onContactChange: (field: keyof RegisterContact, value: string) => void;
};

export function RegisterFields({
  errors,
  contact,
  onContactChange,
}: RegisterFieldsProps) {
  const password = usePasswordVisibility();
  const confirmation = usePasswordVisibility();

  return (
    <div className={cn(fieldStyles.fields, styles.fields)}>
      <div className={styles.fieldPair}>
        <RegisterField id="name" label="Nama lengkap" error={errors?.name}>
          <Input
            id="name"
            name="name"
            value={contact.name}
            onChange={(event) => onContactChange("name", event.target.value)}
            placeholder="Nama lengkap Anda"
            autoComplete="name"
            required
            aria-invalid={!!errors?.name}
            aria-describedby={errors?.name ? "register-name-error" : undefined}
            className={fieldStyles.input}
          />
        </RegisterField>
        <RegisterField id="email" label="Email" error={errors?.email}>
          <Input
            id="email"
            name="email"
            value={contact.email}
            onChange={(event) => onContactChange("email", event.target.value)}
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            aria-invalid={!!errors?.email}
            aria-describedby={
              errors?.email ? "register-email-error" : undefined
            }
            className={fieldStyles.input}
          />
        </RegisterField>
      </div>

      <RegisterField
        id="phone"
        label="Nomor WhatsApp Aktif"
        error={errors?.phone}
        hint="Kode OTP 6-digit akan dikirimkan ke nomor WhatsApp ini untuk verifikasi akun."
      >
        <Input
          id="phone"
          name="phone"
          value={contact.phone}
          onChange={(event) => onContactChange("phone", event.target.value)}
          type="tel"
          placeholder="081234567890"
          autoComplete="tel"
          required
          aria-invalid={!!errors?.phone}
          aria-describedby={
            errors?.phone ? "register-phone-error" : "register-phone-hint"
          }
          className={fieldStyles.input}
        />
      </RegisterField>

      <div className={styles.fieldPair}>
        <RegisterField
          id="password"
          label="Password"
          error={errors?.password}
          hint="Gunakan 8–100 karakter."
        >
          <div className={fieldStyles.passwordControl}>
            <PasswordInput
              id="password"
              name="password"
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              required
              aria-invalid={!!errors?.password}
              aria-describedby={
                errors?.password
                  ? "register-password-error"
                  : "register-password-hint"
              }
              showPassword={password.showPassword}
              onTogglePassword={password.togglePassword}
              className={cn(fieldStyles.input, fieldStyles.passwordInput)}
            />
          </div>
        </RegisterField>
        <RegisterField
          id="confirmPassword"
          label="Konfirmasi password"
          error={errors?.confirmPassword}
          hint="Harus sama dengan password."
        >
          <div className={fieldStyles.passwordControl}>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Ulangi password"
              autoComplete="new-password"
              required
              aria-invalid={!!errors?.confirmPassword}
              aria-describedby={
                errors?.confirmPassword
                  ? "register-confirmPassword-error"
                  : "register-confirmPassword-hint"
              }
              showPassword={confirmation.showPassword}
              onTogglePassword={confirmation.togglePassword}
              toggleLabel={
                confirmation.showPassword
                  ? "Sembunyikan konfirmasi password"
                  : "Tampilkan konfirmasi password"
              }
              className={cn(fieldStyles.input, fieldStyles.passwordInput)}
            />
          </div>
        </RegisterField>
      </div>
    </div>
  );
}
