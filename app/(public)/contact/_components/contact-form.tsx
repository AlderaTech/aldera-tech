"use client";

import Link from "next/link";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Turnstile } from "@/components/shared/turnstile";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { useContactForm } from "../_hooks/use-contact-form";
import styles from "./contact.module.css";

export function ContactForm({ responseTime }: { responseTime: string }) {
  const {
    state,
    isPending,
    submitted,
    prefilledSubject,
    handleSubmit,
    resetForm,
  } = useContactForm();

  if (submitted) {
    return (
      <div className={styles.success} role="status" aria-live="polite">
        <span className={styles.successIcon} aria-hidden="true">
          <CheckCircle2 className="size-8" />
        </span>
        <h3>Pesan Anda sudah terkirim!</h3>
        <p>
          Tim kami akan menghubungi Anda dalam {responseTime} via email atau
          WhatsApp.
        </p>
        <div className={styles.successActions}>
          <Button asChild variant="outline">
            <Link href={PUBLIC_ROUTES.portfolio}>Lihat Portfolio</Link>
          </Button>
          <Button type="button" variant="ghost" onClick={resetForm}>
            Kirim pesan lain
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <Label htmlFor="name" className={styles.label}>
            Nama lengkap <span className={styles.required}>*</span>
          </Label>
          <Input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Nama Anda"
            className={styles.control}
            aria-invalid={!!state.errors?.name}
            aria-describedby={state.errors?.name ? "name-error" : undefined}
          />
          {state.errors?.name && (
            <p id="name-error" role="alert" className={styles.fieldError}>
              {state.errors.name}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <Label htmlFor="email" className={styles.label}>
            Email <span className={styles.required}>*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="nama@email.com"
            className={styles.control}
            aria-invalid={!!state.errors?.email}
            aria-describedby={state.errors?.email ? "email-error" : undefined}
          />
          {state.errors?.email && (
            <p id="email-error" role="alert" className={styles.fieldError}>
              {state.errors.email}
            </p>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <Label htmlFor="phone" className={styles.label}>
          Telepon / WhatsApp <span className={styles.optional}>Opsional</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          autoComplete="tel"
          placeholder="+62..."
          className={styles.control}
          aria-invalid={!!state.errors?.phone}
          aria-describedby={state.errors?.phone ? "phone-error" : undefined}
        />
        {state.errors?.phone && (
          <p id="phone-error" role="alert" className={styles.fieldError}>
            {state.errors.phone}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <Label htmlFor="subject" className={styles.label}>
          Subjek <span className={styles.required}>*</span>
        </Label>
        <Input
          id="subject"
          name="subject"
          required
          placeholder="Misal: Konsultasi website untuk toko online"
          defaultValue={prefilledSubject}
          className={styles.control}
          aria-invalid={!!state.errors?.subject}
          aria-describedby={state.errors?.subject ? "subject-error" : undefined}
        />
        {state.errors?.subject && (
          <p id="subject-error" role="alert" className={styles.fieldError}>
            {state.errors.subject}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <Label htmlFor="message" className={styles.label}>
          Pesan <span className={styles.required}>*</span>
        </Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Ceritakan project atau kebutuhan Anda..."
          className={styles.messageControl}
          aria-invalid={!!state.errors?.message}
          aria-describedby={
            state.errors?.message
              ? "message-hint message-error"
              : "message-hint"
          }
        />
        <p id="message-hint" className={styles.hint}>
          Minimal 10 karakter agar kebutuhan Anda lebih mudah dipahami.
        </p>
        {state.errors?.message && (
          <p id="message-error" role="alert" className={styles.fieldError}>
            {state.errors.message}
          </p>
        )}
      </div>

      <Turnstile className={styles.turnstile} />
      {state.message && !state.ok && (
        <p role="alert" className={styles.formMessage}>
          {state.message}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className={styles.submit}
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
            Mengirim...
          </>
        ) : (
          <>
            <Send className="size-4" /> Kirim Pesan
          </>
        )}
      </Button>
    </form>
  );
}
