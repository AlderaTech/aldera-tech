"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function useDashboardRefresh() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const refresh = () => startTransition(() => router.refresh());
  return { refresh, isPending };
}
