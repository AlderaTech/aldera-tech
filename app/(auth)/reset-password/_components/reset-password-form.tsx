"use client";

import { Suspense } from "react";
import { ResetFormContent } from "./reset-form-content";

export function ResetPasswordForm() {
  return (
    <Suspense>
      <ResetFormContent />
    </Suspense>
  );
}
