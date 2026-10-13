import { Download, File as FileIcon, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { formatDate } from "@/lib/utils";
import { FileUploader } from "@/components/dashboard/file-uploader";
import { FileCardActions } from "./_components/file-card-actions";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function AdminFilesPage() {
  const files = await safeDb(
    async () =>
      await prisma.file.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          uploader: { select: { name: true } },
          project: { select: { title: true, id: true } },
        },
      }),
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">File Manager</h1>
        <p className="text-muted-foreground">
          Semua file yang diunggah ke platform.
        </p>
      </div>

      <FileUploader />

      {files.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          Belum ada file terunggah.
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((f) => {
            const isImage = f.mimeType.startsWith("image/");
            return (
              <Card
                key={f.id}
                className="p-4 transition-shadow hover:shadow-md"
              >
                <div className="relative mb-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-muted">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.url}
                      alt={f.originalName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FileIcon className="size-10 text-muted-foreground" />
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {isImage ? (
                        <ImageIcon className="size-3" />
                      ) : (
                        <FileIcon className="size-3" />
                      )}
                      {f.mimeType.split("/")[1]?.toUpperCase() ?? "FILE"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div
                    className="truncate text-sm font-medium"
                    title={f.originalName}
                  >
                    {f.originalName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatBytes(f.size)} · {formatDate(f.createdAt)}
                  </div>
                  {f.project && (
                    <div className="truncate text-xs text-muted-foreground">
                      Proyek: {f.project.title}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Upload: {f.uploader.name}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    <a href={f.url} download={f.originalName}>
                      <Download className="size-3.5" />
                      Download
                    </a>
                  </Button>
                  <FileCardActions fileId={f.id} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
