import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QueryInputError({
  message,
  resetHref,
}: {
  message: string;
  resetHref: string;
}) {
  return (
    <section
      role="alert"
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <AlertCircle className="mb-3 size-6 text-primary" aria-hidden="true" />
      <h1 className="text-xl font-bold">Periksa filter yang digunakan</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">{message}</p>
      <Button asChild variant="outline" className="mt-4 rounded-full">
        <Link href={resetHref}>Reset filter</Link>
      </Button>
    </section>
  );
}
