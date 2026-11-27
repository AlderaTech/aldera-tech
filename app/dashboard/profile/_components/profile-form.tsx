"use client";

import { Check, CircleAlert, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfileForm } from "../_hooks/use-profile-form";
import type { ProfileValues } from "../_types/profile";
import styles from "./profile.module.css";

export function ProfileForm({
  defaultValues,
}: {
  defaultValues: ProfileValues;
}) {
  const profile = useProfileForm(defaultValues);
  return (
    <form
      action={profile.handleSubmit}
      className={styles.formCard}
      aria-labelledby="profile-form-heading"
      aria-busy={profile.pending}
    >
      <div className={styles.formIntro}>
        <header className={styles.formHeader}>
          <h2 id="profile-form-heading">Informasi profil</h2>
          <p>Perbarui nama dan kontak yang digunakan untuk komunikasi.</p>
        </header>
      </div>
      <div className={styles.formFields}>
        <section
          className={styles.formSection}
          aria-labelledby="personal-heading"
        >
          <h3 id="personal-heading" className="sr-only">
            Informasi pribadi
          </h3>
          <div className={styles.field}>
            <Label htmlFor="name">
              Nama Lengkap{" "}
              <span className={styles.required} aria-hidden="true">
                *
              </span>
            </Label>
            <Input
              id="name"
              name="name"
              required
              autoComplete="name"
              placeholder="Nama lengkap Anda"
              value={profile.values.name}
              onChange={(event) =>
                profile.changeField("name", event.target.value)
              }
              onInvalid={profile.markNameInvalid}
              disabled={profile.pending}
              aria-invalid={!!profile.nameError}
              aria-describedby={profile.nameError ? "name-error" : "name-hint"}
            />
            {profile.nameError && (
              <p id="name-error" className={styles.fieldError} role="alert">
                {profile.nameError}
              </p>
            )}
            <p id="name-hint" className={styles.fieldHint}>
              Nama Anda di workspace Aldera Tech.
            </p>
          </div>
        </section>
        <section
          className={styles.formSection}
          aria-labelledby="contact-heading"
        >
          <h3 id="contact-heading" className="sr-only">
            Informasi kontak
          </h3>
          <div className={styles.field}>
            <Label htmlFor="phone">
              Telepon / WhatsApp{" "}
              <span className={styles.optional}>(Opsional)</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+62..."
              value={profile.values.phone}
              onChange={(event) =>
                profile.changeField("phone", event.target.value)
              }
              disabled={profile.pending}
              aria-describedby="phone-hint"
            />
            <p id="phone-hint" className={styles.fieldHint}>
              Nomor yang dapat digunakan untuk menghubungi Anda. Boleh
              dikosongkan jika belum ingin menambahkan nomor kontak.
            </p>
          </div>
        </section>
        {profile.status && (
          <p
            className={styles.feedback}
            data-kind={profile.status.kind}
            role={profile.status.kind === "error" ? "alert" : "status"}
          >
            {profile.status.kind === "success" ? (
              <Check size={17} aria-hidden="true" />
            ) : (
              <CircleAlert size={17} aria-hidden="true" />
            )}
            <span>{profile.status.message}</span>
          </p>
        )}
      </div>
      <footer className={styles.formFooter}>
        <p>Pastikan informasi Anda sudah sesuai.</p>
        <Button
          type="submit"
          disabled={profile.pending}
          className={styles.saveButton}
        >
          {profile.pending ? (
            <Loader2
              className="animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <Save aria-hidden="true" />
          )}
          {profile.pending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </footer>
    </form>
  );
}
