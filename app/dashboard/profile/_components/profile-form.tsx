"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions/profile";

type Props = {
  defaultValues: { name: string; phone: string };
};

export function ProfileForm({ defaultValues }: Props) {
  const [pending, start] = useTransition();

  function handleSubmit(fd: FormData) {
    start(async () => {
      const res = await updateProfile(fd);
      if (res.ok) toast.success("Profil diperbarui");
      else toast.error(res.message ?? "Gagal memperbarui profil");
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={defaultValues.name}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telepon / WhatsApp</Label>
        <Input
          id="phone"
          name="phone"
          placeholder="+62..."
          defaultValue={defaultValues.phone}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Simpan
      </Button>
    </form>
  );
}
