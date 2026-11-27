"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { API_ROUTES } from "@/lib/routes";

export function FileUploader({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false);

  const onDrop = React.useCallback(
    async (files: File[]) => {
      if (!files.length) return;
      setUploading(true);
      try {
        for (const file of files) {
          const fd = new FormData();
          fd.append("file", file);
          if (projectId) fd.append("projectId", projectId);
          const res = await fetch(API_ROUTES.upload, {
            method: "POST",
            body: fd,
          });
          if (!res.ok) {
            const err = await res
              .json()
              .catch(() => ({ error: "Upload failed" }));
            throw new Error(err.error ?? "Upload failed");
          }
          toast.success(`${file.name} terunggah`);
        }
        router.refresh();
      } catch (err) {
        toast.error((err as Error).message);
      } finally {
        setUploading(false);
      }
    },
    [projectId, router]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "cursor-pointer rounded-2xl border-2 border-dashed border-[#e1e8f2] bg-[#f5f8fd] p-7 text-center transition-all sm:p-9",
        isDragActive
          ? "border-[#245fe5] bg-[#e8f0ff]/60"
          : "hover:border-[#245fe5]/50 hover:bg-[#e8f0ff]/35",
        uploading && "pointer-events-none opacity-60"
      )}
    >
      <input
        placeholder="Pilih file untuk diunggah"
        {...getInputProps({
          "aria-label": "Pilih file untuk diunggah",
        })}
      />
      <div className="flex flex-col items-center gap-2">
        {uploading ? (
          <Loader2 className="size-8 animate-spin text-[#245fe5]" />
        ) : (
          <span className="grid size-11 place-items-center rounded-2xl border border-[#e1e8f2] bg-white text-[#245fe5] shadow-2xs">
            <UploadCloud className="size-5" />
          </span>
        )}
        <div className="text-sm font-bold text-[#102651]">
          {isDragActive
            ? "Lepaskan file di sini…"
            : uploading
              ? "Mengunggah…"
              : "Drag & drop file, atau klik untuk memilih"}
        </div>
        <div className="text-xs font-medium text-[#65748b]">
          Max 10MB per file. PNG/JPG/PDF/DOC/XLS/ZIP diterima.
        </div>
      </div>
    </div>
  );
}
