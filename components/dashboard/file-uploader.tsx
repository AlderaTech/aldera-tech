"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
          const res = await fetch("/api/upload", { method: "POST", body: fd });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: "Upload failed" }));
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
        "border-2 border-dashed rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-all",
        isDragActive ? "border-primary bg-primary/5" : "hover:bg-muted/30",
        uploading && "pointer-events-none opacity-60"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2">
        {uploading ? (
          <Loader2 className="size-8 animate-spin text-primary" />
        ) : (
          <UploadCloud className="size-8 text-muted-foreground" />
        )}
        <div className="text-sm">
          {isDragActive
            ? "Lepaskan file di sini…"
            : uploading
              ? "Mengunggah…"
              : "Drag & drop file, atau klik untuk memilih"}
        </div>
        <div className="text-xs text-muted-foreground">
          Max 10MB per file. PNG/JPG/PDF/DOC/XLS/ZIP diterima.
        </div>
      </div>
    </div>
  );
}
