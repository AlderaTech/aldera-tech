"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ADMIN_ROUTES } from "@/lib/routes";
import {
  createCaseStudyAction,
  updateCaseStudyAction,
  type PortfolioActionState,
} from "@/lib/actions/portfolio";
import type { PortfolioFormInitial } from "../_utils/portfolio-types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function usePortfolioForm(initial?: PortfolioFormInitial) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [client, setClient] = React.useState(initial?.client ?? "");
  const [industry, setIndustry] = React.useState(initial?.industry ?? "");
  const [summary, setSummary] = React.useState(initial?.summary ?? "");
  const [challenge, setChallenge] = React.useState(initial?.challenge ?? "");
  const [solution, setSolution] = React.useState(initial?.solution ?? "");
  const [result, setResult] = React.useState(initial?.result ?? "");
  const [featuredImage, setFeaturedImage] = React.useState(
    initial?.featuredImage ?? ""
  );
  const [techStack, setTechStack] = React.useState<string[]>(
    initial?.techStack ?? ["Next.js", "TypeScript", "Tailwind CSS"]
  );
  const [published, setPublished] = React.useState<boolean>(
    initial?.published ?? true
  );
  const [order, setOrder] = React.useState<number>(initial?.order ?? 0);

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initial?.id) {
      setSlug(slugify(val));
    }
  };

  const addTech = (tech: string) => {
    const trimmed = tech.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      setTechStack([...techStack, trimmed]);
    }
  };

  const removeTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("client", client);
    formData.append("industry", industry);
    formData.append("summary", summary);
    formData.append("challenge", challenge);
    formData.append("solution", solution);
    formData.append("result", result);
    formData.append("featuredImage", featuredImage);
    formData.append("techStack", JSON.stringify(techStack));
    formData.append("published", String(published));
    formData.append("order", String(order));

    startTransition(async () => {
      let state: PortfolioActionState;
      if (initial?.id) {
        state = await updateCaseStudyAction(
          initial.id,
          { ok: false },
          formData
        );
      } else {
        state = await createCaseStudyAction({ ok: false }, formData);
      }

      if (!state.ok) {
        if (state.errors) setErrors(state.errors);
        toast.error(state.message || "Gagal menyimpan studi kasus");
      } else {
        toast.success(state.message || "Studi kasus berhasil disimpan");
        router.push(ADMIN_ROUTES.portfolio);
        router.refresh();
      }
    });
  };

  return {
    isPending,
    title,
    setTitle: handleTitleChange,
    slug,
    setSlug,
    client,
    setClient,
    industry,
    setIndustry,
    summary,
    setSummary,
    challenge,
    setChallenge,
    solution,
    setSolution,
    result,
    setResult,
    featuredImage,
    setFeaturedImage,
    techStack,
    addTech,
    removeTech,
    published,
    setPublished,
    order,
    setOrder,
    errors,
    handleSubmit,
    isEdit: Boolean(initial?.id),
  };
}

export type PortfolioFormReturn = ReturnType<typeof usePortfolioForm>;
