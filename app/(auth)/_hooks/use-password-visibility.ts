"use client";

import { useState } from "react";

export function usePasswordVisibility() {
  const [showPassword, setShowPassword] = useState(false);
  return {
    showPassword,
    inputType: showPassword ? "text" : "password",
    togglePassword: () => setShowPassword((value) => !value),
  };
}
