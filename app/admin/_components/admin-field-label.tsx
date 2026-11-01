import type { ComponentProps } from "react";
import { Label } from "@/components/ui/label";

export function AdminFieldLabel({
  required,
  optional,
  children,
  ...props
}: ComponentProps<typeof Label> & { required?: boolean; optional?: boolean }) {
  return (
    <Label {...props}>
      {children}
      {required ? (
        <span className="text-destructive" aria-hidden="true">
          {" "}
          *
        </span>
      ) : optional ? (
        <span className="font-normal text-muted-foreground"> (Opsional)</span>
      ) : null}
    </Label>
  );
}
