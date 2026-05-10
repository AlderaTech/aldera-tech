"use client";

import { useActionState, useTransition, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  submitContactMessage,
  type ContactActionState,
} from "@/lib/actions/contact";

const initialState: ContactActionState = { ok: false };

export function ContactForm() {
  const searchParams = useSearchParams();
  const prefilledService = searchParams.get("service");
  const prefilledPlan = searchParams.get("plan");

  const [state] = useActionState(submitContactMessage, initialState);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const prefilledSubject =
    prefilledService
      ? `Tertarik dengan layanan: ${prefilledService}`
      : prefilledPlan
        ? `Tertarik dengan paket: ${prefilledPlan}`
        : "";

  useEffect(() => {
    if (prefilledSubject && formRef.current) {
      const sub = formRef.current.elements.namedItem(
        "subject"
      ) as HTMLInputElement | null;
      if (sub && !sub.value) sub.value = prefilledSubject;
    }
  }, [prefilledSubject]);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitContactMessage(state, formData);
      if (result.ok) {
        toast.success(result.message ?? "Pesan terkirim");
        formRef.current?.reset();
      } else if (result.message) {
        toast.error(result.message);
      }
    });
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama lengkap *</Label>
          <Input id="name" name="name" required placeholder="Nama Anda" />
          {state.errors?.name && (
            <p role="alert" className="text-xs text-destructive">
              {state.errors.name}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="nama@email.com"
          />
          {state.errors?.email && (
            <p role="alert" className="text-xs text-destructive">
              {state.errors.email}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telepon / WhatsApp</Label>
        <Input id="phone" name="phone" placeholder="+62..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subjek *</Label>
        <Input
          id="subject"
          name="subject"
          required
          placeholder="Misal: Konsultasi website untuk toko online"
          defaultValue={prefilledSubject}
        />
        {state.errors?.subject && (
          <p role="alert" className="text-xs text-destructive">
            {state.errors.subject}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Pesan *</Label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          required
          placeholder="Ceritakan project atau kebutuhan Anda..."
        />
        {state.errors?.message && (
          <p role="alert" className="text-xs text-destructive">
            {state.errors.message}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Mengirim...
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
