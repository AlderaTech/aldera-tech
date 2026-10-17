"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  submitContactMessage,
  type ContactActionState,
} from "@/lib/actions/contact";

const initialState: ContactActionState = { ok: false };

export function useContactForm() {
  const searchParams = useSearchParams();
  const prefilledService = searchParams.get("service");
  const prefilledPlan = searchParams.get("plan");
  const [state, setState] = useState<ContactActionState>(initialState);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const submitLock = useRef(false);

  const prefilledSubject = prefilledService
    ? `Tertarik dengan layanan: ${prefilledService}`
    : prefilledPlan
      ? `Tertarik dengan paket: ${prefilledPlan}`
      : "";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current) return;

    submitLock.current = true;
    const formData = new FormData(event.currentTarget);
    setState(initialState);

    startTransition(async () => {
      try {
        const result = await submitContactMessage(initialState, formData);
        setState(result);
        if (result.ok) {
          setSubmitted(true);
        } else if (result.message) {
          toast.error(result.message);
        }
      } catch {
        const message = "Gagal mengirim pesan. Silakan coba lagi nanti.";
        setState({ ok: false, message });
        toast.error(message);
      } finally {
        submitLock.current = false;
      }
    });
  }

  function resetForm() {
    setSubmitted(false);
    setState(initialState);
  }

  return {
    state,
    isPending,
    submitted,
    prefilledSubject,
    handleSubmit,
    resetForm,
  };
}
