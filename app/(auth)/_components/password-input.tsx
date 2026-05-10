"use client";

import type { ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

type PasswordInputProps = ComponentProps<typeof Input> & {
  showPassword: boolean;
  onTogglePassword: () => void;
};

export function PasswordInput({
  showPassword,
  onTogglePassword,
  className,
  ...props
}: PasswordInputProps) {
  return (
    <div className="relative">
      <Input
        {...props}
        type={showPassword ? "text" : "password"}
        className={className}
      />
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-3 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-black/42 transition-colors hover:bg-black/5 hover:text-black"
        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
      >
        {showPassword ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </button>
    </div>
  );
}
