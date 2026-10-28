"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import type { ProfileValues } from "../_types/profile";
import { ProfileDialogContent } from "./profile-dialog";
import { ProfileForm } from "./profile-form";
import styles from "./profile.module.css";

export function ProfileEditor({
  defaultValues,
}: {
  defaultValues: ProfileValues;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={styles.editButton}>
          <Pencil className="size-4" aria-hidden="true" />
          Edit Profil
        </Button>
      </DialogTrigger>
      <ProfileDialogContent
        title="Edit Profil"
        description="Perbarui nama dan telepon akun Anda. Email tetap hanya dapat dilihat."
        className={styles.editorDialog}
      >
        <ProfileForm defaultValues={defaultValues} />
      </ProfileDialogContent>
    </Dialog>
  );
}
