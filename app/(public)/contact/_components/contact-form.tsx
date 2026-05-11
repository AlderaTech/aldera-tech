"use client";

import { useTransition, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PUBLIC_ROUTES } from "@/lib/routes";

import {
  submitContactMessage,
  type ContactActionState,
} from "@/lib/actions/contact";

const initialState: ContactActionState = { ok: false };

export function ContactForm() {
  const searchParams = useSearchParams();
  const prefilledService = searchParams.get("service");
  const prefilledPlan = searchParams.get("plan");

  const [state, setState] = useState<ContactActionState>(initialState);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const prefilledSubject =
    prefilledService
      ? `Tertarik dengan layanan: ${prefilledService}`
      : prefilledPlan
        ? `Tertarik dengan paket: ${prefilledPlan}`
        : "";

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await submitContactMessage(initialState, formData);
      setState(result);
      if (result.ok) {
        setSubmitted(true);
      } else if (result.message) {
        toast.error(result.message);
      }
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-[#0b6bff]/10">
          <CheckCircle2 className="size-8 text-[#0b6bff]" />
        </div>
        <h3 className="text-2xl font-black">Pesan Anda sudah terkirim!</h3>
        <p className="mt-2 max-w-md text-sm text-black/62">
          Tim kami akan menghubungi Anda dalam 1x24 jam via email atau WhatsApp.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link href={PUBLIC_ROUTES.portfolio}>Lihat Portfolio</Link>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSubmitted(false);
              setState(initialState);
              formRef.current?.reset();
            }}
          >
            Kirim pesan lain
          </Button>
        </div>
      </div>
    );
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
