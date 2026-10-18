"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/lib/actions/profile";
import type { ProfileValues } from "../_types/profile";

type SaveStatus = { kind: "success" | "error"; message: string } | null;

export function useProfileForm(defaultValues: ProfileValues) {
  const [values, setValues] = useState(defaultValues);
  const [status, setStatus] = useState<SaveStatus>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const requestInFlight = useRef(false);

  useEffect(() => {
    if (nameError && !pending) document.getElementById("name")?.focus();
  }, [nameError, pending]);

  function changeField(field: keyof ProfileValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setStatus(null);
    if (field === "name") setNameError(null);
  }

  function markNameInvalid() {
    setNameError("Nama wajib diisi");
  }

  function handleSubmit(formData: FormData) {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setStatus(null);
    setNameError(null);
    startTransition(async () => {
      try {
        const result = await updateProfile(formData);
        if (result.ok) {
          setStatus({ kind: "success", message: "Profil diperbarui" });
          toast.success("Profil diperbarui");
        } else {
          const message = result.message ?? "Gagal memperbarui profil";
          if (message === "Nama wajib diisi") {
            setNameError(message);
          } else {
            setStatus({ kind: "error", message });
          }
          toast.error(message);
        }
      } catch {
        const message = "Gagal memperbarui profil. Silakan coba lagi.";
        setStatus({ kind: "error", message });
        toast.error(message);
      } finally {
        requestInFlight.current = false;
      }
    });
  }

  return {
    values,
    changeField,
    pending,
    status,
    nameError,
    markNameInvalid,
    handleSubmit,
  };
}
